import { Sub } from "../../lib/nostr-tools/relay";
import { Kind } from "../../lib/nostr-tools/event";
import { Filter } from "../../lib/nostr-tools/filter";
import { TypedEventEmitter } from "./message-event-emitter";
import {
  Channel,
  ChannelMessageHide,
  ChannelUpdate,
  ChannelUserMute,
  DirectMessage,
  EventDeletion,
  Keys,
  Metadata,
  MuteList,
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

export enum RavenEvents {
  Ready = "ready",
  ProfileUpdate = "profile_update",
  ChannelCreation = "channel_creation",
  ChannelUpdate = "channel_update",
  EventDeletion = "event_deletion",
  PublicMessage = "public_message",
  DirectMessage = "direct_message",
  ChannelMessageHide = "channel_message_hide",
  ChannelUserMute = "channel_user_mute",
  MuteList = "mute_list"
}

type EventHandlerMap = {
  [RavenEvents.Ready]: () => void;
  [RavenEvents.ProfileUpdate]: (data: Profile[]) => void;
  [RavenEvents.ChannelCreation]: (data: Channel[]) => void;
  [RavenEvents.ChannelUpdate]: (data: ChannelUpdate[]) => void;
  [RavenEvents.EventDeletion]: (data: EventDeletion[]) => void;
  [RavenEvents.PublicMessage]: (data: PublicMessage[]) => void;
  [RavenEvents.DirectMessage]: (data: DirectMessage[]) => void;
  [RavenEvents.ChannelMessageHide]: (data: ChannelMessageHide[]) => void;
  [RavenEvents.ChannelUserMute]: (data: ChannelUserMute[]) => void;
  [RavenEvents.MuteList]: (data: MuteList) => void;
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
  public directContacts: string[] = [];
  private isActiveUserPushed: boolean = false;

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
        kinds: [Kind.Metadata],
        authors: [this.pub]
      },
      {
        kinds: [Kind.EncryptedDirectMessage],
        authors: [this.pub]
      },
      {
        kinds: [Kind.EncryptedDirectMessage],
        "#p": [this.pub]
      }
    ];
    this.fetchP(filters).then((resp) => {
      const events = resp.sort((a, b) => b.created_at - a.created_at);
      const profile = events.find((x) => x.kind === Kind.Metadata);
      if (profile) this.pushToEventBuffer(profile);
      const directContacts = Array.from(
        new Set(
          events.map((x) => {
            if (x.kind === Kind.EncryptedDirectMessage) {
              const receiver = Raven.findTagValue(x, "p");
              if (!receiver) return undefined;
              return receiver === this.pub ? x.pubkey : receiver;
            }
            return undefined;
          })
        )
      ).filter(notEmpty);

      this.directContacts.push(...directContacts);

      const filters: Filter[] = [
        {
          kinds: [Kind.Metadata],
          authors: directContacts
        },
        ...directContacts.map((x) => ({
          kinds: [Kind.EncryptedDirectMessage],
          "#p": [this.pub],
          authors: [x]
        })),
        ...directContacts.map((x) => ({
          kinds: [Kind.EncryptedDirectMessage],
          "#p": [x],
          authors: [this.pub]
        }))
      ];
      filters.forEach((c) => {
        this.fetch([c]);
      });
      this.emit(RavenEvents.Ready);
    });
  }

  public loadProfiles(pubs: string[]) {
    pubs.forEach((p) => {
      if (!this.directContacts.includes(p)) {
        if (p !== this.pub) {
          this.directContacts.push(p);
        }
        this.fetch([
          {
            kinds: [Kind.Metadata],
            authors: [p]
          }
        ]);
      }
    });
  }

  public directContactForActiveUser(event: Event) {
    if (!this.isActiveUserPushed && !this.directContacts.includes(event.pubkey)) {
      const activeUserProfile = {
        id: event.id,
        creator: event.pubkey,
        created: event.created_at,
        name: JSON.parse(event.content).name,
        about: JSON.parse(event.content).about || "",
        picture: JSON.parse(event.content).picture || ""
      };

      this.emit(RavenEvents.ProfileUpdate, [activeUserProfile]);
      this.isActiveUserPushed = true;
      this.directContacts.push(event.pubkey);
    }
  }

  public addDirectContact(directContact: string) {
    const filters: Filter[] = [
      {
        kinds: [Kind.Metadata],
        authors: [directContact]
      }
    ];

    if (!this.directContacts.includes(directContact) && this.pub !== directContact) {
      this.directContacts.push(directContact);
    }
    this.fetch(filters);
  }

  private fetch(filters: Filter[], unsub: boolean = true) {
    const sub = this.pool.sub(this.readRelays, filters);

    sub.on("event", (event: Event) => {
      this.pushToEventBuffer(event);
      if (event.kind === Kind.Metadata && event.pubkey === this.pub) {
        this.directContactForActiveUser(event);
      }
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

  public listen(since: number) {
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
          kinds: [Kind.EncryptedDirectMessage],
          "#p": [this.pub],
          since
        }
      ],
      false
    );
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
            reject("Couldn't sign event!");
            return;
          }
          const pub = this.pool.publish(this.writeRelays, event);
          pub.on("ok", () => {
            resolve(event);
          });

          pub.on("failed", () => {
            reject("Couldn't sign event!");
          });
        })
        .catch(() => {
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

    const directContacts = profileUpdates.filter((obj) =>
      this.directContacts.includes(obj.creator)
    );

    if (profileUpdates.length > 0) {
      this.emit(RavenEvents.ProfileUpdate, directContacts);
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

  static findTagValue(ev: Event, tag: "e" | "p") {
    return ev.tags.find(([t]) => t === tag)?.[1];
  }

  static filterTagValue(ev: Event, tag: "e" | "p") {
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
  }

  return window.raven;
};
