import React, { useEffect, useState } from "react";

import { ActiveUser } from "../common/store/active-user/types";
import { DirectContactsType } from "../common/store/chat/types";
import { NostrKeysType } from "../common/components/chats/types";
import {
  DirectMessage,
  Profile,
  Keys,
  DirectContact,
  Channel,
  PublicMessage,
  ChannelUpdate,
  MessagesObject
} from "./message-provider-types";

import { initMessageService, MessageEvents } from "../common/helper/message-service";
import { getProfileMetaData, getPrivateKey } from "../common/components/chats/utils";

import { useMappedStore } from "../common/store/use-mapped-store";

export const setNostrkeys = (keys: NostrKeysType) => {
  const detail: NostrKeysType = {
    pub: keys.pub,
    priv: keys.priv
  };
  const ev = new CustomEvent("createMSInstance", { detail });
  window.dispatchEvent(ev);
};

interface Props {
  addDirectContacts: (data?: DirectContactsType[]) => void;
  addDirectMessages: (peer: string, data?: DirectMessage) => void;
  addPublicMessage: (channelId: string, data?: PublicMessage) => void;
  addChannels: (data: Channel[]) => void;
  addProfile: (data: Profile[]) => void;
  addleftChannels: (data: string[]) => void;
  UpdateChannels: (data: ChannelUpdate[]) => void;
  replacePublicMessage: (channelId: string, data?: PublicMessage) => void;
  verifyPublicMessageSending: (channelId: string, data?: PublicMessage) => void;
  replaceDirectMessage: (peer: string, data: DirectMessage) => void;
  verifyDirectMessageSending: (peer: string, data: DirectMessage) => void;
  addPreviousPublicMessages: (channelId: string, data: MessagesObject) => void;
}

const MessageProvider = (props: Props) => {
  const { activeUser, chat } = useMappedStore();
  const [messageServiceReady, setMessageServiceReady] = useState(false);
  const [since, setSince] = useState<number>(0);
  const [keys, setKeys] = useState<Keys>();
  const [messageService, setMessageService] = useState<any>();
  const [directMessageBuffer, setDirectMessageBuffer] = useState<DirectMessage[]>([]);
  const [publicMessageBuffer, setPublicMessageBuffer] = useState<PublicMessage[]>([]);
  const [isCommunityCreated, setIsCommunityCreated] = useState(false);
  const [replacedPublicMessagesBuffer, setReplacedPublicMessagesBuffer] = useState<string[]>([]);
  const [isDirectChatCreated, setIsDirectChatCreated] = useState(false);
  const [replacedDirectMessagesBuffer, setReplacedDirectMessagesBuffer] = useState<string[]>([]);

  useEffect(() => {
    if (chat.channels.length !== 0) {
      setIsCommunityCreated(true);
    }
    if (chat.directMessages.length !== 0) {
      setIsDirectChatCreated(true);
    }
  }, [chat.channels, chat.directMessages]);

  useEffect(() => {
    window.addEventListener("createMSInstance", createMSInstance);

    return () => {
      window.removeEventListener("createMSInstance", createMSInstance);
    };
  }, []);

  useEffect(() => {
    if (!window.messageService && keys?.priv) {
      const messageServiceInstance = initMessageService(keys);
      setMessageService(messageServiceInstance);
    }
  }, [keys]);

  useEffect(() => {
    if (activeUser) {
      getNostrKeys(activeUser);
    }
  }, [activeUser]);

  const createMSInstance = (e: Event) => {
    const detail = (e as CustomEvent).detail as NostrKeysType;
    const messageServiceInstance = initMessageService(detail);
    setMessageService(messageServiceInstance);
  };

  const getNostrKeys = async (activeUser: ActiveUser) => {
    const profile = await getProfileMetaData(activeUser.username);
    const noStrPrivKey = getPrivateKey(activeUser.username);
    const keys = {
      pub: profile.nsKey,
      priv: noStrPrivKey
    };
    setKeys(keys);
  };

  //Listen for events in an interval.
  useEffect(() => {
    if (!messageServiceReady) return;

    const timer = setTimeout(
      () => {
        messageService?.listen(
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
  }, [since, messageServiceReady, messageService, chat.channels]);

  // // Ready state handler
  const handleReadyState = () => {
    setMessageServiceReady(true);
  };

  useEffect(() => {
    messageService?.removeListener(MessageEvents.Ready, handleReadyState);
    messageService?.addListener(MessageEvents.Ready, handleReadyState);

    return () => {
      messageService?.removeListener(MessageEvents.Ready, handleReadyState);
    };
  }, [messageServiceReady, messageService]);

  // Profile update handler
  const handleProfileUpdate = (data: Profile[]) => {
    props.addProfile(data);
  };

  useEffect(() => {
    messageService?.removeListener(MessageEvents.ProfileUpdate, handleProfileUpdate);
    messageService?.addListener(MessageEvents.ProfileUpdate, handleProfileUpdate);
    return () => {
      messageService?.removeListener(MessageEvents.ProfileUpdate, handleProfileUpdate);
    };
  }, [messageService, chat.profiles]);

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
    messageService?.removeListener(MessageEvents.DirectContact, handleDirectContact);
    messageService?.addListener(MessageEvents.DirectContact, handleDirectContact);
    return () => {
      messageService?.removeListener(MessageEvents.DirectContact, handleDirectContact);
    };
  }, [messageService]);

  //Direct message ahandle before sent

  const handleDirectMessageBeforeSent = (data: DirectMessage[]) => {
    data.map((m) => {
      const { peer, id } = m;
      setReplacedDirectMessagesBuffer((prevBuffer) => [...prevBuffer, id]);
      props.addDirectMessages(peer, m);
      checkDirectMessageSending(peer, m);
    });
  };

  useEffect(() => {
    messageService?.removeListener(
      MessageEvents.DirectMessageBeforeSent,
      handleDirectMessageBeforeSent
    );
    messageService?.addListener(
      MessageEvents.DirectMessageBeforeSent,
      handleDirectMessageBeforeSent
    );

    return () => {
      messageService?.removeListener(
        MessageEvents.DirectMessageBeforeSent,
        handleDirectMessageBeforeSent
      );
    };
  }, [messageService, chat.directMessages]);

  const checkDirectMessageSending = (peer: string, data: DirectMessage) => {
    setTimeout(() => {
      props.verifyDirectMessageSending(peer, data);
    }, 20000);
  };

  // // Direct message handler after sent
  const handleDirectMessageAfterSent = (data: DirectMessage[]) => {
    if (isDirectChatCreated) {
      data.forEach((message) => {
        const { peer, id } = message;
        if (replacedDirectMessagesBuffer.includes(id)) {
          setReplacedDirectMessagesBuffer((prevBuffer) =>
            prevBuffer.filter((messageId) => messageId !== id)
          );
          props.replaceDirectMessage(peer, message);
        } else {
          props.addDirectMessages(peer, message);
        }
      });
    } else {
      setDirectMessageBuffer((directMessageBuffer) => [...directMessageBuffer!, ...data]);
    }
    messageService?.checkProfiles(data.map((x) => x.peer));
  };

  const setDirectMessages = () => {
    directMessageBuffer.forEach((obj) => {
      const { peer } = obj;
      const matchingStateItem = chat.directMessages.find((stateItem) => stateItem.peer === peer);
      if (matchingStateItem) {
        props.addDirectMessages(peer, obj);
        setDirectMessageBuffer((prevMessageBuffer) =>
          prevMessageBuffer.filter((message) => message.id !== obj.id)
        );
      }
    });
  };

  useEffect(() => {
    if (chat.directContacts.length !== 0) {
      setDirectMessages();
    }
  }, [chat.directContacts, directMessageBuffer]);

  useEffect(() => {
    messageService?.removeListener(
      MessageEvents.DirectMessageAfterSent,
      handleDirectMessageAfterSent
    );
    messageService?.addListener(MessageEvents.DirectMessageAfterSent, handleDirectMessageAfterSent);

    return () => {
      messageService?.removeListener(
        MessageEvents.DirectMessageAfterSent,
        handleDirectMessageAfterSent
      );
    };
  }, [messageService, chat.directMessages]);

  // Channel creation handler
  const handleChannelCreation = (data: Channel[]) => {
    const append = data.filter((x) => chat.channels.find((y) => y.id === x.id) === undefined);
    props.addChannels(append);
  };

  useEffect(() => {
    messageService?.removeListener(MessageEvents.ChannelCreation, handleChannelCreation);
    messageService?.addListener(MessageEvents.ChannelCreation, handleChannelCreation);

    return () => {
      messageService?.removeListener(MessageEvents.ChannelCreation, handleChannelCreation);
    };
  }, [messageService]);

  // Channel update handler
  const handleChannelUpdate = (data: ChannelUpdate[]) => {
    props.UpdateChannels(data);
  };

  useEffect(() => {
    messageService?.removeListener(MessageEvents.ChannelUpdate, handleChannelUpdate);
    messageService?.addListener(MessageEvents.ChannelUpdate, handleChannelUpdate);

    return () => {
      messageService?.removeListener(MessageEvents.ChannelUpdate, handleChannelUpdate);
    };
  }, [messageService]);

  const checkPublicMessageSending = (channelId: string, data: PublicMessage) => {
    setTimeout(() => {
      props.verifyPublicMessageSending(channelId, data);
    }, 20000);
  };

  //public message handle before sent

  const handlePublicMessageBeforeSent = (data: PublicMessage[]) => {
    data.map((m) => {
      const { id, root } = m;
      setReplacedPublicMessagesBuffer((prevBuffer) => [...prevBuffer, id]);
      props.addPublicMessage(root, m);
      checkPublicMessageSending(root, m);
    });
  };

  useEffect(() => {
    messageService?.removeListener(
      MessageEvents.PublicMessageBeforeSent,
      handlePublicMessageBeforeSent
    );
    messageService?.addListener(
      MessageEvents.PublicMessageBeforeSent,
      handlePublicMessageBeforeSent
    );

    return () => {
      messageService?.removeListener(
        MessageEvents.PublicMessageBeforeSent,
        handlePublicMessageBeforeSent
      );
    };
  }, [messageService, chat.profiles, chat.publicMessages]);

  //Public Message handler after sent
  const handlePublicMessageAfterSent = (data: PublicMessage[]) => {
    if (isCommunityCreated) {
      data.forEach((message) => {
        const { root, id } = message;
        if (replacedPublicMessagesBuffer.includes(id)) {
          setReplacedPublicMessagesBuffer((prevBuffer) =>
            prevBuffer.filter((messageId) => messageId !== id)
          );
          props.replacePublicMessage(root, message);
        } else {
          props.addPublicMessage(root, message);
        }
      });
    } else {
      setPublicMessageBuffer((publicMessageBuffer) => [...publicMessageBuffer, ...data]);
    }

    let uniqueUsers: string[] = [];
    for (const item of data) {
      const isCreatorMatch = chat.profiles.some((profile) => profile.creator === item.creator);

      if (!isCreatorMatch) {
        for (const item of data) {
          if (!uniqueUsers.includes(item.creator)) {
            uniqueUsers.push(item.creator);
          }
        }
      }
    }
    window?.messageService?.loadProfiles(uniqueUsers);
  };

  useEffect(() => {
    messageService?.removeListener(
      MessageEvents.PublicMessageAfterSent,
      handlePublicMessageAfterSent
    );
    messageService?.addListener(MessageEvents.PublicMessageAfterSent, handlePublicMessageAfterSent);

    return () => {
      messageService?.removeListener(
        MessageEvents.PublicMessageAfterSent,
        handlePublicMessageAfterSent
      );
    };
  }, [messageService, chat.profiles, chat.publicMessages]);

  useEffect(() => {
    if (chat.channels.length !== 0 && publicMessageBuffer.length !== 0) {
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
        props.addPublicMessage(root, obj);
        setPublicMessageBuffer((prevMessageBuffer) =>
          prevMessageBuffer.filter((message) => message.id !== obj.id)
        );
      }
    });
  };

  //previous public messages handler
  const handlePreviousPublicMessages = (data: PublicMessage[]) => {
    const channelId = data[0].root;
    const messagesObject: MessagesObject = data.reduce((result, message) => {
      result[message.id] = message;
      return result;
    }, {});

    props.addPreviousPublicMessages(channelId, messagesObject);
  };

  useEffect(() => {
    messageService?.removeListener(
      MessageEvents.PreviousPublicMessages,
      handlePreviousPublicMessages
    );
    messageService?.addListener(MessageEvents.PreviousPublicMessages, handlePreviousPublicMessages);

    return () => {
      messageService?.removeListener(
        MessageEvents.PreviousPublicMessages,
        handlePreviousPublicMessages
      );
    };
  }, [messageService, chat.profiles, chat.publicMessages]);

  // Left channel handler
  const handleLeftChannelList = (data: string[]) => {
    props.addleftChannels(data);
  };

  useEffect(() => {
    messageService?.removeListener(MessageEvents.LeftChannelList, handleLeftChannelList);
    messageService?.addListener(MessageEvents.LeftChannelList, handleLeftChannelList);

    return () => {
      messageService?.removeListener(MessageEvents.LeftChannelList, handleLeftChannelList);
    };
  }, [messageService, chat.leftChannelsList]);

  useEffect(() => {
    return () => {
      messageService?.removeListener(MessageEvents.Ready, handleReadyState);
      messageService?.removeListener(MessageEvents.ProfileUpdate, handleProfileUpdate);
      messageService?.removeListener(MessageEvents.ChannelCreation, handleChannelCreation);
      messageService?.removeListener(MessageEvents.DirectContact, handleDirectContact);
      messageService?.removeListener(MessageEvents.LeftChannelList, handleLeftChannelList);
      messageService?.removeListener(MessageEvents.ChannelUpdate, handleChannelUpdate);
      messageService?.removeListener(
        MessageEvents.PreviousPublicMessages,
        handlePreviousPublicMessages
      );
      messageService?.removeListener(
        MessageEvents.PublicMessageBeforeSent,
        handlePublicMessageBeforeSent
      );
      messageService?.removeListener(
        MessageEvents.PublicMessageAfterSent,
        handlePublicMessageAfterSent
      );
      messageService?.removeListener(
        MessageEvents.DirectMessageBeforeSent,
        handleDirectMessageBeforeSent
      );
      messageService?.removeListener(
        MessageEvents.DirectMessageAfterSent,
        handleDirectMessageAfterSent
      );
    };
  }, [messageService]);

  return <>{}</>;
};

export default MessageProvider;
