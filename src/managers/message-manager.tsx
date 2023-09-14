import React, { useContext, useEffect, useState } from "react";

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
} from "./message-manager-types";

import MessageService, { MessageEvents } from "../common/helper/message-service";
import { getProfileMetaData, getPrivateKey } from "../common/components/chats/utils";

import { useMappedStore } from "../common/store/use-mapped-store";
import { ChatContext } from "../common/components/chats/chat-context-provider";

export const setNostrkeys = (keys: NostrKeysType) => {
  const detail: NostrKeysType = {
    pub: keys.pub,
    priv: keys.priv
  };
  const ev = new CustomEvent("createMSInstance", { detail });
  window.dispatchEvent(ev);
};

const MessageManager = () => {
  const {
    activeUser,
    chat,
    addDirectMessages,
    addDirectContacts,
    addPublicMessage,
    addChannels,
    addProfile,
    addleftChannels,
    UpdateChannels,
    replacePublicMessage,
    verifyPublicMessageSending,
    replaceDirectMessage,
    verifyDirectMessageSending,
    addPreviousPublicMessages
  } = useMappedStore();

  const [messageServiceReady, setMessageServiceReady] = useState(false);
  const [since, setSince] = useState(0);
  const [keys, setKeys] = useState<Keys>();
  const [messageService, setMessageService] = useState<MessageService | undefined>(undefined);
  const [directMessageBuffer, setDirectMessageBuffer] = useState<DirectMessage[]>([]);
  const [publicMessageBuffer, setPublicMessageBuffer] = useState<PublicMessage[]>([]);
  const [isCommunityCreated, setIsCommunityCreated] = useState(false);
  const [replacedPublicMessagesBuffer, setReplacedPublicMessagesBuffer] = useState<string[]>([]);
  const [isDirectChatCreated, setIsDirectChatCreated] = useState(false);
  const [replacedDirectMessagesBuffer, setReplacedDirectMessagesBuffer] = useState<string[]>([]);

  const { messageServiceInstance, initMessageServiceInstance, setMessageServiceInstance } =
    useContext(ChatContext);

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
    if (!messageServiceInstance && keys?.priv) {
      const messageService = initMessageServiceInstance(keys);
      setMessageServiceInstance(messageService!);
      setMessageService(messageService!);
    }
  }, [keys]);

  useEffect(() => {
    if (activeUser) {
      getNostrKeys(activeUser);
    }
  }, [activeUser]);

  const createMSInstance = (e: Event) => {
    const detail = (e as CustomEvent).detail as NostrKeysType;
    const messageService = initMessageServiceInstance(detail);
    setMessageServiceInstance(messageService!);
    setMessageService(messageService!);
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
    addProfile(data);
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
      addDirectContacts(result);
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
      addDirectMessages(peer, m);
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
      verifyDirectMessageSending(peer, data);
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
          replaceDirectMessage(peer, message);
        } else {
          addDirectMessages(peer, message);
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
        addDirectMessages(peer, obj);
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
    console.log("handle channel creation run");
    addChannels(data.filter((x) => !chat.channels.find((y) => y.id === x.id)));
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
    UpdateChannels(data);
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
      verifyPublicMessageSending(channelId, data);
    }, 20000);
  };

  //public message handle before sent

  const handlePublicMessageBeforeSent = (data: PublicMessage[]) => {
    data.map((m) => {
      const { id, root } = m;
      setReplacedPublicMessagesBuffer((prevBuffer) => [...prevBuffer, id]);
      addPublicMessage(root, m);
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
          replacePublicMessage(root, message);
        } else {
          addPublicMessage(root, message);
        }
      });
    } else {
      setPublicMessageBuffer((publicMessageBuffer) => [...publicMessageBuffer, ...data]);
    }
    let uniqueUsers: string[] = [];

    for (const item of data) {
      const isCreatorMatch = chat.profiles.find((profile) => profile.creator === item.creator);

      if (!isCreatorMatch) {
        if (!uniqueUsers.includes(item.creator)) {
          uniqueUsers.push(item.creator);
        }
      }
    }
    messageServiceInstance?.loadProfiles(uniqueUsers);
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
        addPublicMessage(root, obj);
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

    addPreviousPublicMessages(channelId, messagesObject);
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
    addleftChannels(data);
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

export default MessageManager;
