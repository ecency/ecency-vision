import React, { useEffect, useState } from "react";
import { Channel, Keys } from "./managers/message-manager-types";
import useDebounce from "react-use/lib/useDebounce";
import MessageService from "../../helper/message-service";
import { useMappedStore } from "../../store/use-mapped-store";
import { NostrKeysType } from "./types";
import { useMount } from "react-use";
import { useKeysQuery } from "./queries/keys-query";
import { useJoinChat } from "./mutations/join-chat";
import { MessageListenerQueriesProvider } from "./queries";

interface Context {
  activeUserKeys: NostrKeysType;
  showSpinner: boolean;
  revealPrivKey: boolean;
  chatPrivKey: string;
  receiverPubKey: string;
  messageServiceInstance: MessageService | null;
  hasUserJoinedChat: boolean;
  currentChannel: Channel | null;
  windowWidth: number;
  isActiveUserRemoved: boolean;
  setCurrentChannel: (channel: Channel) => void;
  setRevealPrivKey: (d: boolean) => void;
  setShowSpinner: (d: boolean) => void;
  setChatPrivKey: (key: string) => void;
  setActiveUserKeys: (keys: NostrKeysType) => void;
  setReceiverPubKey: (key: string) => void;
  setMessageServiceInstance: (instance: MessageService | null) => void;
  initMessageServiceInstance: (keys: Keys) => MessageService | null;
}

interface Props {
  children: JSX.Element | JSX.Element[];
}

export const ChatContext = React.createContext<Context>({
  activeUserKeys: { pub: " ", priv: "" },
  showSpinner: false,
  revealPrivKey: false,
  chatPrivKey: "",
  receiverPubKey: "",
  messageServiceInstance: null,
  hasUserJoinedChat: false,
  currentChannel: null,
  windowWidth: 0,
  isActiveUserRemoved: false,
  setCurrentChannel: () => {},
  setRevealPrivKey: () => {},
  setShowSpinner: () => {},
  setChatPrivKey: () => {},
  setActiveUserKeys: () => {},
  setReceiverPubKey: () => {},
  setMessageServiceInstance: () => {},
  initMessageServiceInstance: () => (({} as MessageService) || null)
});

export const ChatContextProvider = (props: Props) => {
  const { activeUser, chat, resetChat } = useMappedStore();

  const [activeUserKeys, setActiveUserKeys] = useState<NostrKeysType>({ pub: "", priv: "" });
  const [showSpinner, setShowSpinner] = useState(true);
  const [chatPrivKey, setChatPrivKey] = useState("");
  const [revealPrivKey, setRevealPrivKey] = useState(false);
  const [receiverPubKey, setReceiverPubKey] = useState("");
  const [messageServiceInstance, setMessageServiceInstance] = useState<MessageService | null>(null);
  const [hasUserJoinedChat, setHasUserJoinedChat] = useState(false);
  const [shouldUpdateProfile, setShouldUpdateProfile] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isActiveUserRemoved, setIsActiveUserRemoved] = useState(false);

  const { privateKey, publicKey, refetch } = useKeysQuery(activeUserKeys, setActiveUserKeys);

  useJoinChat(() => {
    setHasUserJoinedChat(true);
    setShouldUpdateProfile(true);
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

  useEffect(() => {
    refetch();
    if (
      messageServiceInstance &&
      chat.profiles.some((profile) => profile.name === activeUser?.username)
    ) {
      setShouldUpdateProfile(false);
    }
  }, [messageServiceInstance, chat.profiles]);

  useEffect(() => {
    if (shouldUpdateProfile && messageServiceInstance) {
      messageServiceInstance.updateProfile({
        name: activeUser?.username!,
        about: "",
        picture: ""
      });
    }
  }, [shouldUpdateProfile, messageServiceInstance]);

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
    <MessageListenerQueriesProvider>
      <ChatContext.Provider
        value={{
          activeUserKeys,
          showSpinner,
          revealPrivKey,
          receiverPubKey,
          chatPrivKey,
          messageServiceInstance,
          hasUserJoinedChat,
          currentChannel,
          windowWidth,
          isActiveUserRemoved,
          setCurrentChannel,
          setRevealPrivKey,
          setShowSpinner,
          setChatPrivKey,
          setActiveUserKeys,
          setReceiverPubKey,
          setMessageServiceInstance,
          initMessageServiceInstance
        }}
      >
        {props.children}
      </ChatContext.Provider>
    </MessageListenerQueriesProvider>
  );
};
