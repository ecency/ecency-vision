import React, { useEffect, useState } from "react";

import { ActiveUser } from "../common/store/active-user/types";
import { Chat, DirectContactsType } from "../common/store/chat/types";
import { DirectMessage, Profile, Keys, DirectContact } from "./message-provider-types";

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
}

const MessageProvider = (props: Props) => {
  const { activeUser, chat } = useMappedStore();
  const [ravenReady, setRavenReady] = useState(false);
  const [since, setSince] = useState<number>(0);
  const [keys, setKeys] = useState<Keys>();
  const [raven, setRaven] = useState<any>();
  const [messageBuffer, setMessageBuffer] = useState<DirectMessage[]>([]);

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
        raven?.listen(Math.floor((since || Date.now()) / 1000));
        setSince(Date.now());
      },
      since === 0 ? 500 : 10000
    );

    return () => {
      clearTimeout(timer);
    };
  }, [since, ravenReady, raven]);

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

  const handleProfileUpdate = (data: DirectContact[]) => {
    const result = [...chat.directContacts];
    data.forEach(({ name, pubkey }) => {
      const isPresent = chat.directContacts.some(
        (obj) => obj.name === name && obj.pubkey === pubkey
      );
      if (!isPresent) {
        //Add the object to the result array if it's not already present in store state.
        result.push({ name, pubkey });
      }
    });
    if (result.length !== 0) {
      props.addDirectContacts(result);
    }
  };

  useEffect(() => {
    raven?.removeListener(RavenEvents.DirectContact, handleProfileUpdate);
    raven?.addListener(RavenEvents.DirectContact, handleProfileUpdate);
    return () => {
      raven?.removeListener(RavenEvents.DirectContact, handleProfileUpdate);
    };
  }, [raven]);

  // // Direct message handler
  const handleDirectMessage = (data: DirectMessage[]) => {
    setMessageBuffer((messageBuffer) => [...messageBuffer!, ...data]);
    raven?.checkProfiles(data.map((x) => x.peer));
  };

  const setMessages = () => {
    messageBuffer.forEach((obj) => {
      const { peer } = obj;
      const matchingStateItem = chat.directMessages.find((stateItem) => stateItem.peer === peer);
      if (matchingStateItem) {
        if (matchingStateItem.chat.length === 0) {
          props.addDirectMessages(peer, [obj]);
          setMessageBuffer((prevMessageBuffer) =>
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
            setMessageBuffer((prevMessageBuffer) =>
              prevMessageBuffer.filter((message) => message.id !== obj.id)
            );
          }
        }
      }
    });
  };

  useEffect(() => {
    if (chat.directContacts.length !== 0) {
      setMessages();
    }
  }, [chat.directContacts, messageBuffer]);

  useEffect(() => {
    raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
    raven?.addListener(RavenEvents.DirectMessage, handleDirectMessage);
    return () => {
      raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
    };
  }, [raven]);

  useEffect(() => {
    return () => {
      raven?.removeListener(RavenEvents.Ready, handleReadyState);
      raven?.removeListener(RavenEvents.DirectContact, handleProfileUpdate);
      raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
    };
  }, [raven]);

  return <>{}</>;
};

export default MessageProvider;
