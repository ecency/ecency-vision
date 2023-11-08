import React, { useState } from "react";
import { NostrKeysType } from "../types";
import { useMappedStore } from "../../../store/use-mapped-store";
import { usePrevious } from "../../../util/use-previous";

export const setNostrkeys = (keys: NostrKeysType) => {
  const detail: NostrKeysType = {
    pub: keys.pub,
    priv: keys.priv
  };
  const ev = new CustomEvent("createMSInstance", { detail });
  window.dispatchEvent(ev);
};

const MessageManager = () => {
  const { activeUser } = useMappedStore();
  const prevActiveUser = usePrevious(activeUser);

  const [messageServiceReady, setMessageServiceReady] = useState(false);

  //Listen for events in an interval.
  // useMessageServiceListener(messageServiceReady, messageService);

  // // Ready state handler
  const handleReadyState = () => {
    setMessageServiceReady(true);
  };
  //
  // useEffect(() => {
  //   messageService?.removeListener(MessageEvents.Ready, handleReadyState);
  //   messageService?.addListener(MessageEvents.Ready, handleReadyState);
  //
  //   return () => {
  //     messageService?.removeListener(MessageEvents.Ready, handleReadyState);
  //   };
  // }, [messageServiceReady, messageService]);

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

  return <>{}</>;
};

export default MessageManager;
