import React, { useContext, useEffect, useState } from "react";
import { ActiveUser } from "../../../store/active-user/types";
import { NostrKeysType } from "../types";
import {
  DirectMessage,
  Keys,
  MessagesObject,
  Profile,
  PublicMessage
} from "./message-manager-types";
import MessageService, { MessageEvents } from "../../../helper/message-service";
import { getPrivateKey, getProfileMetaData } from "../utils";
import { useMappedStore } from "../../../store/use-mapped-store";
import { ChatContext } from "../chat-context-provider";
import { usePrevious } from "../../../util/use-previous";
import { useMessageServiceListener } from "../hooks/use-message-service-listener";
import { useChannelsQuery, useDirectContactsQuery } from "../queries";

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
    addPublicMessage,
    addProfile,
    addleftChannels,
    UpdateChannels,
    replacePublicMessage,
    verifyPublicMessageSending,
    replaceDirectMessage,
    verifyDirectMessageSending,
    addPreviousPublicMessages,
    resetChat
  } = useMappedStore();
  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();

  const prevActiveUser = usePrevious(activeUser);

  const [messageServiceReady, setMessageServiceReady] = useState(false);
  const [keys, setKeys] = useState<Keys>();
  const [messageService, setMessageService] = useState<MessageService | undefined>(undefined);
  const [directMessageBuffer, setDirectMessageBuffer] = useState<DirectMessage[]>([]);
  const [publicMessageBuffer, setPublicMessageBuffer] = useState<PublicMessage[]>([]);
  const [isCommunityCreated, setIsCommunityCreated] = useState(false);
  const [replacedPublicMessagesBuffer, setReplacedPublicMessagesBuffer] = useState<string[]>([]);
  const [replacedDirectMessagesBuffer, setReplacedDirectMessagesBuffer] = useState<string[]>([]);

  const { messageServiceInstance, initMessageServiceInstance, setMessageServiceInstance } =
    useContext(ChatContext);

  useEffect(() => {
    if (channels?.length !== 0) {
      setIsCommunityCreated(true);
    }
  }, [channels]);

  useEffect(() => {
    window.addEventListener("createMSInstance", createMSInstance);

    return () => {
      window.removeEventListener("createMSInstance", createMSInstance);
    };
  }, []);

  useEffect(() => {
    if (keys?.priv) {
      const messageService = initMessageServiceInstance(keys);
      setMessageServiceInstance(messageService);
      setMessageService(messageService!);
    } else {
      setMessageServiceInstance(null);
    }
  }, [keys]);

  useEffect(() => {
    if (activeUser) {
      getNostrKeys(activeUser);
    }
    if (prevActiveUser?.username !== activeUser?.username) {
      resetChat();
      getNostrKeys(activeUser!);
    }
  }, [activeUser]);

  const createMSInstance = (e: Event) => {
    const detail = (e as CustomEvent).detail as NostrKeysType;
    const messageService = initMessageServiceInstance(detail);
    setMessageServiceInstance(messageService);
    setMessageService(messageService!);
  };

  const getNostrKeys = async (activeUser: ActiveUser) => {
    const profile = await getProfileMetaData(activeUser.username);
    const noStrPrivKey = getPrivateKey(activeUser.username);
    const keys = {
      pub: profile?.nsKey,
      priv: noStrPrivKey!!
    };
    setKeys(keys);
  };

  //Listen for events in an interval.
  useMessageServiceListener(messageServiceReady, messageService);

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

  // const checkPublicMessageSending = (channelId: string, data: PublicMessage) => {
  //   setTimeout(() => {
  //     verifyPublicMessageSending(channelId, data);
  //   }, 20000);
  // };

  //public message handle before sent

  // const handlePublicMessageBeforeSent = (data: PublicMessage[]) => {
  //   data.map((m) => {
  //     const { id, root } = m;
  //     setReplacedPublicMessagesBuffer((prevBuffer) => [...prevBuffer, id]);
  //     addPublicMessage(root, m);
  //     checkPublicMessageSending(root, m);
  //   });
  // };

  // useEffect(() => {
  //   messageService?.removeListener(
  //     MessageEvents.PublicMessageBeforeSent,
  //     handlePublicMessageBeforeSent
  //   );
  //   messageService?.addListener(
  //     MessageEvents.PublicMessageBeforeSent,
  //     handlePublicMessageBeforeSent
  //   );
  //
  //   return () => {
  //     messageService?.removeListener(
  //       MessageEvents.PublicMessageBeforeSent,
  //       handlePublicMessageBeforeSent
  //     );
  //   };
  // }, [messageService, chat.profiles, chat.publicMessages]);

  //Public Message handler after sent
  // const handlePublicMessageAfterSent = (data: PublicMessage[]) => {
  //   if (isCommunityCreated) {
  //     data.forEach((message) => {
  //       const { root, id } = message;
  //       if (replacedPublicMessagesBuffer.includes(id)) {
  //         setReplacedPublicMessagesBuffer((prevBuffer) =>
  //           prevBuffer.filter((messageId) => messageId !== id)
  //         );
  //         replacePublicMessage(root, message);
  //       } else {
  //         addPublicMessage(root, message);
  //       }
  //     });
  //   } else {
  //     setPublicMessageBuffer((publicMessageBuffer) => [...publicMessageBuffer, ...data]);
  //   }
  //   let uniqueUsers: string[] = [];
  //
  //   for (const item of data) {
  //     const isCreatorMatch = chat.profiles.find((profile) => profile.creator === item.creator);
  //
  //     if (!isCreatorMatch) {
  //       if (!uniqueUsers.includes(item.creator)) {
  //         uniqueUsers.push(item.creator);
  //       }
  //     }
  //   }
  //   messageServiceInstance?.loadProfiles(uniqueUsers);
  // };

  // useEffect(() => {
  //   messageService?.removeListener(
  //     MessageEvents.PublicMessageAfterSent,
  //     handlePublicMessageAfterSent
  //   );
  //   messageService?.addListener(MessageEvents.PublicMessageAfterSent, handlePublicMessageAfterSent);
  //
  //   return () => {
  //     messageService?.removeListener(
  //       MessageEvents.PublicMessageAfterSent,
  //       handlePublicMessageAfterSent
  //     );
  //   };
  // }, [messageService, chat.profiles, chat.publicMessages]);

  // useEffect(() => {
  //   if (channels?.length !== 0 && publicMessageBuffer.length !== 0) {
  //     setPublicMessages();
  //   }
  // }, [chat.publicMessages, publicMessageBuffer]);

  // const setPublicMessages = () => {
  //   publicMessageBuffer.forEach((obj) => {
  //     const { root } = obj;
  //     const matchingStateItem = chat.publicMessages.find(
  //       (stateItem) => stateItem.channelId === root
  //     );
  //     if (matchingStateItem) {
  //       addPublicMessage(root, obj);
  //       setPublicMessageBuffer((prevMessageBuffer) =>
  //         prevMessageBuffer.filter((message) => message.id !== obj.id)
  //       );
  //     }
  //   });
  // };

  //previous public messages handler
  // const handlePreviousPublicMessages = (data: PublicMessage[]) => {
  //   const channelId = data[0].root;
  //   const messagesObject: MessagesObject = data.reduce((result, message) => {
  //     result[message.id] = message;
  //     return result;
  //   }, {});
  //
  //   addPreviousPublicMessages(channelId, messagesObject);
  // };

  // useEffect(() => {
  //   messageService?.removeListener(
  //     MessageEvents.PreviousPublicMessages,
  //     handlePreviousPublicMessages
  //   );
  //   messageService?.addListener(MessageEvents.PreviousPublicMessages, handlePreviousPublicMessages);
  //
  //   return () => {
  //     messageService?.removeListener(
  //       MessageEvents.PreviousPublicMessages,
  //       handlePreviousPublicMessages
  //     );
  //   };
  // }, [messageService, chat.profiles, chat.publicMessages]);

  useEffect(() => {
    return () => {
      messageService?.removeListener(MessageEvents.Ready, handleReadyState);
      messageService?.removeListener(MessageEvents.ProfileUpdate, handleProfileUpdate);
      // messageService?.removeListener(
      //   MessageEvents.PreviousPublicMessages,
      //   handlePreviousPublicMessages
      // );
      // messageService?.removeListener(
      //   MessageEvents.PublicMessageBeforeSent,
      //   handlePublicMessageBeforeSent
      // );
      // messageService?.removeListener(
      //   MessageEvents.PublicMessageAfterSent,
      //   handlePublicMessageAfterSent
      // );
    };
  }, [messageService]);

  return <>{}</>;
};

export default MessageManager;
