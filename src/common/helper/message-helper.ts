import { Sub } from "../../lib/nostr-tools/relay";
import { Kind } from "../../lib/nostr-tools/event";
import { Filter } from "../../lib/nostr-tools/filter";
import { TypedEventEmitter } from "./message-event-emitter";
import {
  Channel,
  DirectContact,
  DirectMessage,
  Keys,
  Metadata,
  Profile,
  PublicMessage
} from "../../providers/message-provider-types";
import { encrypt, decrypt } from "../../lib/nostr-tools/nip04";
import SimplePool from "../../lib/nostr-tools/pool";
import { signEvent, getEventHash, Event } from "../../lib/nostr-tools/event";
import { notEmpty } from "./chat-utils";

const relays = {
  "wss://relay1.nostrchat.io": { read: true, write: true },
  "wss://relay2.nostrchat.io": { read: true, write: true },
  "wss://relay.damus.io": { read: true, write: true },
  "wss://relay.snort.social": { read: true, write: true },
  "wss://nos.lol": { read: true, write: true }
};

enum NewKinds {
  MuteList = 10000,
  Arbitrary = 30078
}

export enum RavenEvents {
  Ready = "ready",
  ProfileUpdate = "profile_update",
  ChannelCreation = "channel_creation",
  DirectMessage = "direct_message",
  DirectContact = "direct_contact",
  PublicMessage = "public_message"
}

type EventHandlerMap = {
  [RavenEvents.Ready]: () => void;
  [RavenEvents.ProfileUpdate]: (data: Profile[]) => void;
  [RavenEvents.DirectMessage]: (data: DirectMessage[]) => void;
  [RavenEvents.ChannelCreation]: (data: Channel[]) => void;
  [RavenEvents.PublicMessage]: (data: PublicMessage[]) => void;
  [RavenEvents.DirectContact]: (data: DirectContact[]) => void;
};

class Raven extends TypedEventEmitter<RavenEvents, EventHandlerMap> {
  private pool: SimplePool;
  private poolL: SimplePool;

  private readonly priv: string | "nip07";
  private readonly pub: string;

  private readonly readRelays = Object.keys(relays).filter((r) => relays[r].read);
  private readonly writeRelays = Object.keys(relays).filter((r) => relays[r].write);

  private eventQueue: Event[] = [];
  private eventQueueTimer: any;
  private eventQueueFlag = true;
  private eventQueueBuffer: Event[] = [];
  public directContacts: any = [];

  private nameCache: Record<string, number> = {};

  listenerSub: Sub | null = null;
  messageListenerSub: Sub | null = null;

  constructor(priv: string, pub: string) {
    super();

    this.priv = priv;
    this.pub = pub;

    this.pool = new SimplePool();
    this.poolL = new SimplePool({ eoseSubTimeout: 10000 });

    this.init().then();
  }

  private async init() {
    this.eventQueue = [];
    this.eventQueueFlag = true;
    this.eventQueueBuffer = [];

    const filters: Filter[] = [
      {
        kinds: [Kind.Contacts],
        authors: [this.pub]
      },
      {
        kinds: [Kind.ChannelCreation, Kind.EventDeletion],
        authors: [this.pub]
      },
      {
        kinds: [Kind.ChannelMessage],
        authors: [this.pub]
      },
      {
        kinds: [NewKinds.Arbitrary],
        authors: [this.pub],
        "#d": ["left-channel-list", "read-mark-map"]
      }
    ];
    this.fetchP(filters).then((resp) => {
      const events = resp.sort((a, b) => b.created_at - a.created_at);
      const deletions = resp
        .filter((x) => x.kind === Kind.EventDeletion)
        .map((x) => Raven.findTagValue(x, "e"));
      const profile = events.find((x) => x.kind === Kind.Contacts);
      if (profile && profile?.tags.length !== 0) {
        this.directContacts = profile?.tags;
        this.pushToEventBuffer(profile!);
      }

      const leftChannelList = events.find(
        (x) =>
          x.kind.toString() === NewKinds.Arbitrary.toString() &&
          Raven.findTagValue(x, "d") === "left-channel-list"
      );
      console.log(leftChannelList, "leftChannelList");
      if (leftChannelList) {
        this.pushToEventBuffer(leftChannelList);
      }

      const channels = Array.from(
        new Set(
          events
            .map((x) => {
              if (x.kind === Kind.ChannelCreation) {
                return x.id;
              }

              if (x.kind === Kind.ChannelMessage) {
                return Raven.findTagValue(x, "e");
              }

              return undefined;
            })
            .filter((x) => !deletions.includes(x))
            .filter(notEmpty)
        )
      );
      if (channels.length !== 0) {
        this.fetchChannels(channels);
      }

      this.fetchMessages();
      this.emit(RavenEvents.Ready);
    });
  }

  public fetchChannels(channels: string[]) {
    const filters: Filter[] = [
      {
        kinds: [Kind.ChannelCreation],
        ids: channels
      },
      ...channels.map((c) => ({
        kinds: [Kind.ChannelMetadata, Kind.EventDeletion],
        "#e": [c]
      })),
      ...channels.map((c) => ({
        kinds: [Kind.ChannelMessage],
        "#e": [c],
        limit: 30
      }))
    ];

    filters.forEach((c) => {
      this.fetch([c]);
    });
  }

  public fetchMessages() {
    this.directContacts.map((contact: any) => {
      const filters: Filter[] = [
        {
          kinds: [Kind.EncryptedDirectMessage],
          "#p": [contact[0]],
          authors: [this.pub]
        },
        {
          kinds: [Kind.EncryptedDirectMessage],
          "#p": [this.pub],
          authors: [contact[0]]
        }
      ];
      this.fetch(filters);
    });
  }

  public publishContacts(username: string, pubkey: string) {
    const newUser = [pubkey, username];
    newUser.forEach((element) => {
      let nameExist = false;

      // Check if the name exists in the first array
      this.directContacts.forEach((existingElement: string[]) => {
        if (existingElement[0] === element || existingElement[1] === element) {
          nameExist = true;
          return;
        }
      });

      // If the name doesn't exist, add the element to the direct contacts array
      if (!nameExist) {
        this.directContacts.push(newUser);
        this.publish(Kind.Contacts, this.directContacts, "");
        return;
      }
    });
  }

  public getContacts() {
    const filters: Filter[] = [
      {
        kinds: [Kind.Contacts],
        authors: [this.pub]
      }
    ];
    this.fetch(filters);
  }

  public loadChannel(id: string) {
    // console.log(id, "id");
    const filters: Filter[] = [
      {
        kinds: [Kind.ChannelCreation],
        ids: [id]
      },
      {
        kinds: [Kind.ChannelMetadata, Kind.EventDeletion],
        "#e": [id]
      },
      {
        kinds: [Kind.ChannelMessage],
        "#e": [id],
        limit: 30
      }
    ];

    this.fetch(filters);
  }

  public loadProfiles(pubs: string[]) {
    console.log("load profiles run");
    pubs.forEach((p) => {
      this.fetch(
        [
          {
            kinds: [Kind.Metadata],
            authors: [p]
          }
        ],
        true,
        false
      );
    });
  }

  public checkProfiles(pubs: string[]) {
    pubs.forEach((p) => {
      if (this.directContacts.length !== 0) {
        this.directContacts.forEach((c: any) => {
          if (p !== c[0]) {
            this.fetch(
              [
                {
                  kinds: [Kind.Metadata],
                  authors: [p]
                }
              ],
              true,
              true
            );
          }
        });
      } else {
        this.fetch(
          [
            {
              kinds: [Kind.Metadata],
              authors: [p]
            }
          ],
          true,
          true
        );
      }
    });
  }

  private addDirectContact(event: Event) {
    let isAdded = false;
    const user = {
      id: event.id,
      creator: event.pubkey,
      created: event.created_at,
      name: JSON.parse(event.content).name,
      about: JSON.parse(event.content).about || "",
      picture: JSON.parse(event.content).picture || ""
    };
    const { creator, name } = user;
    if (!isAdded) {
      this.publishContacts(name, creator);
      isAdded = true;
    }
  }

  private fetch(filters: Filter[], unsub: boolean = true, isDirectContact: boolean = false) {
    // console.log("Fetch run", filters);
    const sub = this.pool.sub(this.readRelays, filters);

    sub.on("event", (event: Event) => {
      event.kind === Kind.Metadata && isDirectContact
        ? this.addDirectContact(event)
        : this.pushToEventBuffer(event);
    });

    sub.on("eose", () => {
      if (unsub) {
        sub.unsub();
      }
    });

    return sub;
  }

  private fetchP(filters: Filter[], lowLatencyPool: boolean = false): Promise<Event[]> {
    return new Promise((resolve) => {
      const sub = (lowLatencyPool ? this.poolL : this.pool).sub(this.readRelays, filters);
      const events: Event[] = [];

      sub.on("event", (event: Event) => {
        events.push(event);
      });

      sub.on("eose", () => {
        sub.unsub();
        resolve(events);
      });
    });
  }

  public listen(channels: string[], since: number) {
    if (this.listenerSub) {
      this.listenerSub.unsub();
    }

    this.listenerSub = this.fetch(
      [
        {
          authors: [this.pub],
          since
        },
        {
          kinds: [Kind.EventDeletion, Kind.ChannelMetadata, Kind.ChannelMessage],
          "#e": channels,
          since
        },
        {
          kinds: [Kind.EncryptedDirectMessage],
          "#p": [this.pub],
          since
        }
      ],
      false
    );
  }

  public async createChannel(meta: Metadata) {
    // console.log("create channel run");
    return this.publish(Kind.ChannelCreation, [], JSON.stringify(meta));
  }

  private async findHealthyRelay(relays: string[]) {
    for (const relay of relays) {
      try {
        await this.pool.ensureRelay(relay);
        return relay;
      } catch (e) {}
    }

    throw new Error("Couldn't find a working relay");
  }

  public async updateProfile(profile: Metadata) {
    return this.publish(Kind.Metadata, [], JSON.stringify(profile));
  }

  public async sendDirectMessage(toPubkey: string, message: string, parent?: string) {
    const encrypted = await (this.priv === "nip07"
      ? window.nostr!.nip04.encrypt(toPubkey, message)
      : encrypt(this.priv, toPubkey, message));
    const tags = [["p", toPubkey]];
    if (parent) {
      const relay = await this.findHealthyRelay(this.pool.seenOn(parent) as string[]);
      tags.push(["e", parent, relay, "root"]);
    }
    return this.publish(Kind.EncryptedDirectMessage, tags, encrypted);
  }

  public async sendPublicMessage(
    channel: Channel,
    message: string,
    mentions?: string[],
    parent?: string
  ) {
    const root = parent || channel.id;
    const relay = await this.findHealthyRelay(this.pool.seenOn(root) as string[]);
    const tags = [["e", root, relay, "root"]];
    if (mentions) {
      mentions.forEach((m) => tags.push(["p", m]));
    }
    return this.publish(Kind.ChannelMessage, tags, message);
  }

  private publish(kind: number, tags: Array<any>[], content: string): Promise<Event> {
    return new Promise((resolve, reject) => {
      this.signEvent({
        kind,
        tags,
        pubkey: this.pub,
        content,
        created_at: Math.floor(Date.now() / 1000),
        id: "",
        sig: ""
      })
        .then((event) => {
          if (!event) {
            console.log("Event not found");
            reject("Couldn't sign event!");
            return;
          }
          const pub = this.pool.publish(this.writeRelays, event);
          pub.on("ok", () => {
            resolve(event);
            console.log("event is send", event);
            if (event.kind === Kind.Contacts) {
              this.getContacts();
            }
          });

          pub.on("failed", () => {
            console.log("Failed to sign event");
            reject("Couldn't sign event!");
          });
        })
        .catch(() => {
          console.log("Catch run event not");
          reject("Couldn't sign event!");
        });
    });
  }

  private async signEvent(event: Event): Promise<Event | undefined> {
    if (this.priv === "nip07") {
      return window.nostr?.signEvent(event);
    } else {
      return {
        ...event,
        id: getEventHash(event),
        sig: await signEvent(event, this.priv)
      };
    }
  }

  pushToEventBuffer(event: Event) {
    const cacheKey = `${event.id}_emitted`;
    if (this.nameCache[cacheKey] === undefined) {
      if (this.eventQueueFlag) {
        if (this.eventQueueBuffer.length > 0) {
          this.eventQueue.push(...this.eventQueueBuffer);
          this.eventQueueBuffer = [];
        }
        clearTimeout(this.eventQueueTimer);
        this.eventQueue.push(event);
        this.eventQueueTimer = setTimeout(() => {
          this.processEventQueue().then();
        }, 50);
      } else {
        this.eventQueueBuffer.push(event);
      }

      this.nameCache[cacheKey] = 1;
    }
  }

  async processEventQueue() {
    this.eventQueueFlag = false;
    const directContacts = this.eventQueue
      .filter((x) => x.kind === Kind.Contacts)
      .map((e: any) => {
        const profiles: Array<[string, string]> = e.tags;
        return profiles.map(([pubkey, name]) => ({ pubkey, name }));
      })
      .filter(notEmpty);

    if (directContacts.length > 0) {
      const directContactsProfile: Array<{ pubkey: string; name: string }> = directContacts[0];

      if (directContactsProfile.length > 0) {
        this.emit(RavenEvents.DirectContact, directContactsProfile);
      }
    }

    const profileUpdates: Profile[] = this.eventQueue
      .filter((x) => x.kind === Kind.Metadata)
      .map((ev) => {
        const content = Raven.parseJson(ev.content);
        return content
          ? {
              id: ev.id,
              creator: ev.pubkey,
              created: ev.created_at,
              ...Raven.normalizeMetadata(content)
            }
          : null;
      })
      .filter(notEmpty);
    if (profileUpdates.length > 0) {
      this.emit(RavenEvents.ProfileUpdate, profileUpdates);
    }

    const channelCreations: Channel[] = this.eventQueue
      .filter((x) => x.kind === Kind.ChannelCreation)
      .map((ev) => {
        const content = Raven.parseJson(ev.content);
        // console.log(content,"events")
        return content
          ? {
              id: ev.id,
              creator: ev.pubkey,
              created: ev.created_at,
              communityName: content.communityName,
              ...Raven.normalizeMetadata(content)
            }
          : null;
      })
      .filter(notEmpty);
    if (channelCreations.length > 0) {
      this.emit(RavenEvents.ChannelCreation, channelCreations);
    }

    const publicMessages: PublicMessage[] = this.eventQueue
      .filter((x) => x.kind === Kind.ChannelMessage)
      .map((ev) => {
        const eTags = Raven.filterTagValue(ev, "e");
        const root = eTags.find((x) => x[3] === "root")?.[1];
        const mentions = Raven.filterTagValue(ev, "p")
          .map((x) => x?.[1])
          .filter(notEmpty);
        if (!root) return null;
        return ev.content
          ? {
              id: ev.id,
              root,
              content: ev.content,
              creator: ev.pubkey,
              mentions,
              created: ev.created_at
            }
          : null;
      })
      .filter(notEmpty);
    if (publicMessages.length > 0) {
      this.emit(RavenEvents.PublicMessage, publicMessages);
    }

    Promise.all(
      this.eventQueue
        .filter((x) => x.kind === Kind.EncryptedDirectMessage)
        .map((ev) => {
          const receiver = Raven.findTagValue(ev, "p");
          if (!receiver) return null;
          const eTags = Raven.filterTagValue(ev, "e");
          const root = eTags.find((x) => x[3] === "root")?.[1];

          const peer = receiver === this.pub ? ev.pubkey : receiver;
          const msg = {
            id: ev.id,
            root,
            content: ev.content,
            peer,
            creator: ev.pubkey,
            created: ev.created_at,
            decrypted: false
          };

          if (this.priv === "nip07") {
            return msg;
          }

          return decrypt(this.priv, peer, ev.content).then((content) => {
            return {
              ...msg,
              content,
              decrypted: true
            };
          });
        })
        .filter(notEmpty)
    ).then((directMessages: DirectMessage[]) => {
      this.emit(RavenEvents.DirectMessage, directMessages);
    });

    this.eventQueue = [];
    this.eventQueueFlag = true;
  }

  close = () => {
    this.pool.close(this.readRelays);
    this.removeAllListeners();
  };

  static normalizeMetadata(meta: Metadata) {
    return {
      name: meta.name || "",
      about: meta.about || "",
      picture: meta.picture || ""
    };
  }

  static parseJson(d: string) {
    try {
      return JSON.parse(d);
    } catch (e) {
      return null;
    }
  }

  static findTagValue(ev: Event, tag: "e" | "p" | "d") {
    return ev.tags.find(([t]) => t === tag)?.[1];
  }

  static filterTagValue(ev: Event, tag: "e" | "p" | "d") {
    return ev.tags.filter(([t]) => t === tag);
  }
}

export default Raven;

export const initRaven = (keys: Keys): Raven | undefined => {
  if (window.raven) {
    window.raven.close();
    window.raven = undefined;
  }

  if (keys) {
    window.raven = new Raven(keys.priv, keys.pub);
    console.log("window raven", window.raven);
  }

  return window.raven;
};
