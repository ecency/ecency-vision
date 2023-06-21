import React, { useEffect, useState } from "react";

import { ActiveUser } from "../common/store/active-user/types";
import { Chat, DirectContactsType } from "../common/store/chat/types";
import { DirectMessage, Profile, Keys } from "./message-provider-types";

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
  activeUser: ActiveUser;
  chat: Chat;
  addDirectContacts: (data?: DirectContactsType[]) => void;
  addDirectMessages: (data?: DirectMessage[]) => void;
}

const MessageProvider = (props: Props) => {
  const { activeUser } = useMappedStore();
  const [ravenReady, setRavenReady] = useState(false);
  const [since, setSince] = useState<number>(0);
  const [keys, setKeys] = useState<Keys>();
  const [raven, setRaven] = useState<any>();

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

  // // Direct message handler
  const handleDirectMessage = (data: DirectMessage[]) => {
    const append = data.filter(
      (x) => props.chat.directMessages.find((y) => y.id === x.id) === undefined
    );
    raven?.loadProfiles(append.map((x) => x.peer));
    const result = [...props.chat.directMessages, ...append];

    props.addDirectMessages(result);
  };

  useEffect(() => {
    raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
    raven?.addListener(RavenEvents.DirectMessage, handleDirectMessage);
    return () => {
      raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
    };
  }, [raven]);

  const handleProfileUpdate = (data: Profile[]) => {
    const result = [...props.chat.directContacts];
    data.forEach(({ name, creator }) => {
      const isPresent = props.chat.directContacts.some(
        (obj) => obj.name === name && obj.creator === creator
      );
      if (!isPresent) {
        //Add the object to the result array if it's not already present in store state.
        result.push({ name, creator });
      }
    });

    props.addDirectContacts(result);
  };

  useEffect(() => {
    raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
    raven?.addListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
    return () => {
      raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
    };
  }, [raven]);

  useEffect(() => {
    return () => {
      raven?.removeListener(RavenEvents.Ready, handleReadyState);
      raven?.removeListener(RavenEvents.ProfileUpdate, handleProfileUpdate);
      raven?.removeListener(RavenEvents.DirectMessage, handleDirectMessage);
    };
  }, [raven]);

  return <>{}</>;
};

export default MessageProvider;
