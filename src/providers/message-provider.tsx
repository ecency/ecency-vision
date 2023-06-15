import React, { useEffect, useMemo, useState } from "react";
import { getProfileMetaData, GLOBAL_CHAT, NostrKeys } from "../common/helper/chat-utils";
import { ActiveUser } from "../common/store/active-user/types";
// import uniq from 'lodash.uniq';
// import {nip19} from 'nostr-tools';

// import {
//     channelsAtom,
//     channelUpdatesAtom,
//     directContactsAtom,
//     directMessagesAtom,
//     eventDeletionsAtom,
//     keysAtom,
//     profileAtom,
//     profilesAtom,
//     publicMessagesAtom,
//     ravenAtom,
//     ravenReadyAtom,
//     channelMessageHidesAtom,
//     channelUserMutesAtom,
//     muteListAtom, directMessageAtom
// } from 'store';
import { initRaven, RavenEvents } from "../common/helper/message-helper";
import {
  Channel,
  ChannelUpdate,
  DirectMessage,
  EventDeletion,
  Profile,
  PublicMessage,
  ChannelMessageHide,
  ChannelUserMute,
  MuteList,
  Keys
} from "./message-provider-types";
import { useMappedStore } from "../common/store/use-mapped-store";
import { Account } from "../common/store/accounts/types";
import { Chat, DirectContactsType } from "../common/store/chat/types";

// import {createLogger} from 'logger';

// const logger = createLogger('RavenProvider');

export const setNostrkeys = (keys: NostrKeys) => {
  const detail: NostrKeys = {
    pub: keys.pub,
    priv: keys.priv
  };
  const ev = new CustomEvent("keysCreated", { detail });
  window.dispatchEvent(ev);
};

interface Props {
  activeUser: ActiveUser;
  chat: Chat;
  addDirectContacts: (data?: DirectContactsType[]) => void;
  addDirectMessages: (data?: DirectMessage[]) => void;
}

const MessageProvider = (props: Props) => {
  // console.log(props.addDirectMessages, "MessageProvider")
  const { activeUser } = useMappedStore();
  const [ravenReady, setRavenReady] = useState(false);
  // const [profile, setProfile] = useAtom(profileAtom);
  // const [profiles, setProfiles] = useAtom(profilesAtom);
  // const [channels, setChannels] = useAtom(channelsAtom);
  // const [channelUpdates, setChannelUpdates] = useAtom(channelUpdatesAtom);
  // const [eventDeletions, setEventDeletions] = useAtom(eventDeletionsAtom);
  // const [publicMessages, setPublicMessages] = useAtom(publicMessagesAtom);
  // const [directMessages, setDirectMessages] = useAtom(directMessagesAtom);
  // const [directMessage,] = useAtom(directMessageAtom);
  // const [channelMessageHides, setChannelMessageHides] = useAtom(channelMessageHidesAtom);
  // const [channelUserMutes, setChannelUserMutes] = useAtom(channelUserMutesAtom);
  // const [muteList, setMuteList] = useAtom(muteListAtom);
  // const [, setDirectContacts] = useAtom(directContactsAtom);
  const [since, setSince] = useState<number>(0);
  const [keys, setKeys] = useState<Keys>();
  const [raven, setRaven] = useState<any>();

  // const ravenInstance = useMemo(() => initRaven(keys!), [keys]);
  // setRaven(ravenInstance);

  useEffect(() => {
    window.addEventListener("keysCreated", createRavenInstance);

    return () => {
      window.removeEventListener("keysCreated", createRavenInstance);
    };
  }, []);

  useEffect(() => {
    if (!window.raven && keys) {
      const ravenInstance = initRaven(keys);
      setRaven(ravenInstance);
    }
  }, [keys]);

  // useEffect(() => {
  //   console.log(raven);
  //   if(raven){
  //     raven?.updateProfile({name:activeUser?.username, about: "", picture: ""});
  //   }
  // }, [raven]);

  useEffect(() => {
    if (activeUser) {
      getNostrKeys(activeUser);
    }
  }, [activeUser]);

  const createRavenInstance = (e: Event) => {
    const detail = (e as CustomEvent).detail as NostrKeys;
    const ravenInstance = initRaven(detail);
    setRaven(ravenInstance);
  };

  const getNostrKeys = async (activeUser: ActiveUser) => {
    const profile = await getProfileMetaData(activeUser.username);
    setKeys(profile.noStrKey);
  };

  //Listen for events in an interval.
  useEffect(() => {
    if (!ravenReady) return;

    const timer = setTimeout(
      () => {
        raven?.listen(Math.floor((since || Date.now()) / 1000));
        setSince(Date.now());
      },
      since === 0 ? 500 : 10000
    );

    return () => {
      clearTimeout(timer);
    };
  }, [since, ravenReady, raven]);

  // // Trigger listen once the window visibility changes.
  // const visibilityChange = () => {
  //   if (document.visibilityState === "visible") {
  //     raven?.listen(
  //       channels.map((x) => x.id),
  //       Math.floor((since || Date.now()) / 1000)
  //     );
  //     setSince(Date.now());
  //   }
  // };
  // useEffect(() => {
  //   document.addEventListener("visibilitychange", visibilityChange);

  //   return () => {
  //     document.removeEventListener("visibilitychange", visibilityChange);
  //   };
  // }, [since, ravenReady, raven, channels]);

  // useEffect(() => {
  //   setDirectContacts(
  //     [...new Set(directMessages.map((x) => x.peer))].map((p) => ({
  //       pub: p,
  //       npub: nip19.npubEncode(p)
  //     }))
  //   );
  // }, [directMessages]);

  // // Ready state handler
  const handleReadyState = () => {
    setRavenReady(true);
  };

  useEffect(() => {
    raven?.removeListener(RavenEvents.Ready, handleReadyState);
    raven?.addListener(RavenEvents.Ready, handleReadyState);

    return () => {
      raven?.removeListener(RavenEvents.Ready, handleReadyState);
    };
  }, [ravenReady, raven]);

  // // Event deletion handler
  // const handleEventDeletion = (data: EventDeletion[]) => {
  //   logger.info("handleEventDeletion", data);
  //   const append = data.filter(
  //     (x) => eventDeletions.find((y) => y.eventId === x.eventId) === undefined
  //   );
  //   setEventDeletions([...eventDeletions, ...append]);
  // };

  // useEffect(() => {
  //   raven?.removeListener(RavenEvents.EventDeletion, handleEventDeletion);
  //   raven?.addListener(RavenEvents.EventDeletion, handleEventDeletion);

  //   return () => {
  //     raven?.removeListener(RavenEvents.EventDeletion, handleEventDeletion);
  //   };
  // }, [raven, eventDeletions]);

  // // Direct message handler
  const handleDirectMessage = (data: DirectMessage[]) => {
    console.log("handleDirectMessage", data);
    console.log(props.chat.directMessages);
    const append = data.filter(
      (x) => props.chat.directMessages.find((y) => y.id === x.id) === undefined
    );
    // console.log("append", [...props.chat.directMessages, ...append]);

    const result = [...props.chat.directMessages, ...append];
    // console.log(result, 'result')
    // raven?.loadProfiles(data.map((x) => x.peer));
    props.addDirectMessages(result);
    // const clean = data
    //   .filter((x) => x.peer === "ad2b87073a67f664621c92dbc925f3d1be3e4df64968fdeb4d15c6736ef42300")
    //   .sort((a, b) => a.created - b.created);

    // console.log(clean, "clean");
    // const finalData = clean
    //   .map((c) => ({ ...c, children: clean.filter((x) => x.root === c.id) }))
    //   .filter((x) => !x.root);

    // console.log(finalData, "finalData");
  };

  useEffect(() => {
    raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
    raven?.addListener(RavenEvents.DirectMessage, handleDirectMessage);
    return () => {
      raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
    };
  }, [raven]);

  const handleProfileUpdate = (data: Profile[]) => {
    // console.log("handleProfileData", data);
    // console.log("Store state", props.chat.directContacts);

    const result = [...props.chat.directContacts];
    const activeUserName = props.activeUser?.username;

    data.forEach(({ name, creator }) => {
      const isPresent = props.chat.directContacts.some(
        (obj) => obj.name === name && obj.creator === creator
      );
      const isCurrentUser = name === activeUserName;
      if (!isPresent && !isCurrentUser) {
        // Add the object to the result array if it's not already present in store state.
        result.push({ name, creator });
      }
    });

    // console.log("result", result);
    props.addDirectContacts(result);
  };

  useEffect(() => {
    raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
    raven?.addListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
    return () => {
      raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
    };
  }, [raven]);

  // // decrypt direct messages one by one to avoid show nip7 wallet dialog many times.
  // useEffect(() => {
  //   if (directMessage) {
  //     const decrypted = directMessages
  //       .filter((m) => m.peer === directMessage)
  //       .find((x) => !x.decrypted);
  //     if (decrypted) {
  //       window.nostr?.nip04.decrypt(decrypted.peer, decrypted.content).then((content) => {
  //         setDirectMessages(
  //           directMessages.map((m) => {
  //             if (m.id === decrypted.id) {
  //               return {
  //                 ...m,
  //                 content,
  //                 decrypted: true
  //               };
  //             }
  //             return m;
  //           })
  //         );
  //       });
  //     }
  //   }
  // }, [directMessages, directMessage]);

  // Init raven
  // useEffect(() => {
  //   return () => {
  //     raven?.removeListener(RavenEvents.Ready, handleReadyState);

  //     // raven?.removeListener(RavenEvents.EventDeletion, handleEventDeletion);

  //     raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
  //   };
  // }, [raven]);

  return <>{}</>;
};

export default MessageProvider;
