import React, { useEffect, useState } from "react";
import { Channel, Keys } from "./managers/message-manager-types";
import useDebounce from "react-use/lib/useDebounce";
import MessageService from "../../helper/message-service";
import { NostrKeysType } from "./types";
import { useMount } from "react-use";
import { useKeysQuery } from "./queries/keys-query";
import { useJoinChat } from "./mutations";
import { NostrListenerQueriesProvider, NostrProvider } from "./nostr";

interface Context {
  showSpinner: boolean;
  revealPrivKey: boolean;
  chatPrivKey: string;
  receiverPubKey: string;
  messageServiceInstance: MessageService | null;
  hasUserJoinedChat: boolean;
  windowWidth: number;
  isActiveUserRemoved: boolean;
  setCurrentChannel: (channel: Channel) => void;
  setRevealPrivKey: (d: boolean) => void;
  setShowSpinner: (d: boolean) => void;
  setChatPrivKey: (key: string) => void;
  setReceiverPubKey: (key: string) => void;
  setMessageServiceInstance: (instance: MessageService | null) => void;
  initMessageServiceInstance: (keys: Keys) => MessageService | null;
}

interface Props {
  children: JSX.Element | JSX.Element[];
}

export const ChatContext = React.createContext<Context>({
  showSpinner: false,
  revealPrivKey: false,
  chatPrivKey: "",
  receiverPubKey: "",
  messageServiceInstance: null,
  hasUserJoinedChat: false,
  windowWidth: 0,
  isActiveUserRemoved: false,
  setCurrentChannel: () => {},
  setRevealPrivKey: () => {},
  setShowSpinner: () => {},
  setChatPrivKey: () => {},
  setReceiverPubKey: () => {},
  setMessageServiceInstance: () => {},
  initMessageServiceInstance: () => (({} as MessageService) || null)
});

export const ChatContextProvider = (props: Props) => {
  // TODO: USE QUERY INTEAD
  const [activeUserKeys, setActiveUserKeys] = useState<NostrKeysType>({ pub: "", priv: "" });
  const [showSpinner, setShowSpinner] = useState(true);
  const [chatPrivKey, setChatPrivKey] = useState("");
  const [revealPrivKey, setRevealPrivKey] = useState(false);
  const [receiverPubKey, setReceiverPubKey] = useState("");
  const [messageServiceInstance, setMessageServiceInstance] = useState<MessageService | null>(null);
  const [hasUserJoinedChat, setHasUserJoinedChat] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isActiveUserRemoved, setIsActiveUserRemoved] = useState(false);

  const { privateKey, publicKey, refetch } = useKeysQuery();

  useJoinChat(() => {
    setHasUserJoinedChat(true);
  });

  useDebounce(() => setShowSpinner(false), 5000, [showSpinner]);

  useMount(() => {
    setWindowWidth(window.innerWidth);
  });

  useEffect(() => {
    setHasUserJoinedChat(!!publicKey);
  }, [publicKey]);

  useEffect(() => {
    if (privateKey) {
      setChatPrivKey(privateKey);
    }
  }, [privateKey]);

  useEffect(() => {
    if (currentChannel && currentChannel.removedUserIds) {
      setIsActiveUserRemoved(currentChannel.removedUserIds?.includes(activeUserKeys?.pub!));
    }
  }, [currentChannel]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const initMessageServiceInstance = (keys: Keys) => {
    if (messageServiceInstance) {
      messageServiceInstance.close();
      setMessageServiceInstance(null);
    }

    let newMessageService: MessageService | null = null;
    if (keys) {
      newMessageService = new MessageService(keys.priv, keys.pub);
      setMessageServiceInstance(newMessageService);
    }
    return newMessageService;
  };

  return (
    <NostrListenerQueriesProvider>
      <ChatContext.Provider
        value={{
          showSpinner,
          revealPrivKey,
          receiverPubKey,
          chatPrivKey,
          messageServiceInstance,
          hasUserJoinedChat,
          windowWidth,
          isActiveUserRemoved,
          setCurrentChannel,
          setRevealPrivKey,
          setShowSpinner,
          setChatPrivKey,
          setReceiverPubKey,
          setMessageServiceInstance,
          initMessageServiceInstance
        }}
      >
        <NostrProvider>{props.children}</NostrProvider>
      </ChatContext.Provider>
    </NostrListenerQueriesProvider>
  );
};
