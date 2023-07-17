import React, { useEffect, useState } from "react";

import { ActiveUser } from "../common/store/active-user/types";
import { Chat, DirectContactsType } from "../common/store/chat/types";
import {
  DirectMessage,
  Profile,
  Keys,
  DirectContact,
  Channel,
  PublicMessage
} from "./message-provider-types";

import { initRaven, RavenEvents } from "../common/helper/message-helper";
import { getProfileMetaData, NostrKeys } from "../common/helper/chat-utils";

import { useMappedStore } from "../common/store/use-mapped-store";

export const setNostrkeys = (keys: NostrKeys) => {
  const detail: NostrKeys = {
    pub: keys.pub,
    priv: keys.priv
  };
  const ev = new CustomEvent("createRavenInstance", { detail });
  window.dispatchEvent(ev);
};

interface Props {
  addDirectContacts: (data?: DirectContactsType[]) => void;
  addDirectMessages: (peer: string, data?: DirectMessage[]) => void;
  addPublicMessage: (channelId: string, data?: PublicMessage[]) => void;
  addChannels: (data: Channel[]) => void;
  addProfile: (data: Profile[]) => void;
}

const MessageProvider = (props: Props) => {
  const { activeUser, chat } = useMappedStore();
  const [ravenReady, setRavenReady] = useState(false);
  const [since, setSince] = useState<number>(0);
  const [keys, setKeys] = useState<Keys>();
  const [raven, setRaven] = useState<any>();
  const [directMessageBuffer, setDirectMessageBuffer] = useState<DirectMessage[]>([]);
  const [publicMessageBuffer, setPublicMessageBuffer] = useState<PublicMessage[]>([]);

  useEffect(() => {
    window.addEventListener("createRavenInstance", createRavenInstance);

    return () => {
      window.removeEventListener("createRavenInstance", createRavenInstance);
    };
  }, []);

  useEffect(() => {
    if (!window.raven && keys) {
      const ravenInstance = initRaven(keys);
      setRaven(ravenInstance);
    }
  }, [keys]);

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
        raven?.listen(
          chat.channels.map((x) => x.id),
          Math.floor((since || Date.now()) / 1000)
        );
        setSince(Date.now());
      },
      since === 0 ? 500 : 10000
    );

    return () => {
      clearTimeout(timer);
    };
  }, [since, ravenReady, raven, chat.channels]);

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

  // Profile update handler
  const handleProfileUpdate = (data: Profile[]) => {
    console.log("handleProfileUpdate", data);
    props.addProfile(data);
  };

  useEffect(() => {
    raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
    raven?.addListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
    return () => {
      raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
    };
  }, [raven, chat.profiles]);

  //Direct contact handler
  const handleDirectContact = (data: DirectContact[]) => {
    const result = [...chat.directContacts];
    data.forEach(({ name, pubkey }) => {
      const isPresent = chat.directContacts.some(
        (obj) => obj.name === name && obj.pubkey === pubkey
      );
      if (!isPresent) {
        result.push({ name, pubkey });
      }
    });
    if (result.length !== 0) {
      props.addDirectContacts(result);
    }
  };

  useEffect(() => {
    raven?.removeListener(RavenEvents.DirectContact, handleDirectContact);
    raven?.addListener(RavenEvents.DirectContact, handleDirectContact);
    return () => {
      raven?.removeListener(RavenEvents.DirectContact, handleDirectContact);
    };
  }, [raven]);

  // // Direct message handler
  const handleDirectMessage = (data: DirectMessage[]) => {
    setDirectMessageBuffer((directMessageBuffer) => [...directMessageBuffer!, ...data]);
    console.log("HandleDirectMessage", data);
    raven?.checkProfiles(data.map((x) => x.peer));
  };

  const setDirectMessages = () => {
    directMessageBuffer.forEach((obj) => {
      const { peer } = obj;
      const matchingStateItem = chat.directMessages.find((stateItem) => stateItem.peer === peer);
      if (matchingStateItem) {
        if (matchingStateItem.chat.length === 0) {
          props.addDirectMessages(peer, [obj]);
          setDirectMessageBuffer((prevMessageBuffer) =>
            prevMessageBuffer.filter((message) => message.id !== obj.id)
          );
        } else {
          let itemExists = false;
          matchingStateItem.chat.forEach((item) => {
            if (item.id === obj.id) {
              itemExists = true;
            }
          });
          if (!itemExists) {
            props.addDirectMessages(peer, [obj]);
            setDirectMessageBuffer((prevMessageBuffer) =>
              prevMessageBuffer.filter((message) => message.id !== obj.id)
            );
          }
        }
      }
    });
  };

  useEffect(() => {
    if (chat.directContacts.length !== 0) {
      setDirectMessages();
    }
  }, [chat.directContacts, directMessageBuffer]);

  useEffect(() => {
    raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
    raven?.addListener(RavenEvents.DirectMessage, handleDirectMessage);
    return () => {
      raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
    };
  }, [raven]);

  // Channel creation handler
  const handleChannelCreation = (data: Channel[]) => {
    console.log("handleChannelCreation", data);

    const append = data.filter((x) => chat.channels.find((y) => y.id === x.id) === undefined);
    props.addChannels(append);
  };

  useEffect(() => {
    raven?.removeListener(RavenEvents.ChannelCreation, handleChannelCreation);
    raven?.addListener(RavenEvents.ChannelCreation, handleChannelCreation);

    return () => {
      raven?.removeListener(RavenEvents.ChannelCreation, handleChannelCreation);
    };
  }, [raven]);

  //Public Message handler
  const handlePublicMessage = (data: PublicMessage[]) => {
    console.log("handlePublicMessage", data, chat.profiles);
    setPublicMessageBuffer((publicMessageBuffer) => [...publicMessageBuffer!, ...data]);

    for (const item of data) {
      const isCreatorMatch = chat.profiles.some((firstItem) => firstItem.creator === item.creator);

      if (!isCreatorMatch) {
        let uniqueUsers: string[] = [];
        for (const item of data) {
          if (!uniqueUsers.includes(item.creator)) {
            uniqueUsers.push(item.creator);
          }
        }
        raven?.loadProfiles(uniqueUsers);
      }
    }
  };

  useEffect(() => {
    raven?.removeListener(RavenEvents.PublicMessage, handlePublicMessage);
    raven?.addListener(RavenEvents.PublicMessage, handlePublicMessage);

    return () => {
      raven?.removeListener(RavenEvents.PublicMessage, handlePublicMessage);
    };
  }, [raven, chat.profiles, chat.publicMessages]);

  useEffect(() => {
    if (chat.channels.length !== 0) {
      setPublicMessages();
    }
  }, [chat.publicMessages, publicMessageBuffer]);

  const setPublicMessages = () => {
    publicMessageBuffer.forEach((obj) => {
      const { root } = obj;
      const matchingStateItem = chat.publicMessages.find(
        (stateItem) => stateItem.channelId === root
      );
      if (matchingStateItem) {
        if (matchingStateItem.PublicMessage.length === 0) {
          props.addPublicMessage(root, [obj]);
          setPublicMessageBuffer((prevMessageBuffer) =>
            prevMessageBuffer.filter((message) => message.id !== obj.id)
          );
        } else {
          let itemExists = false;
          matchingStateItem.PublicMessage.forEach((item) => {
            if (item.id === obj.id) {
              itemExists = true;
            }
          });
          if (!itemExists) {
            props.addPublicMessage(root, [obj]);
            setPublicMessageBuffer((prevMessageBuffer) =>
              prevMessageBuffer.filter((message) => message.id !== obj.id)
            );
          }
        }
      }
    });
  };

  useEffect(() => {
    return () => {
      raven?.removeListener(RavenEvents.Ready, handleReadyState);
      raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
      raven?.removeListener(RavenEvents.ChannelCreation, handleChannelCreation);
      raven?.removeListener(RavenEvents.DirectContact, handleDirectContact);
      raven?.removeListener(RavenEvents.PublicMessage, handlePublicMessage);
      raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
    };
  }, [raven]);

  return <>{}</>;
};

export default MessageProvider;
