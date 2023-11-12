import React, { useEffect, useState } from "react";
import useDebounce from "react-use/lib/useDebounce";
import MessageService from "../../helper/message-service";
import { useMount } from "react-use";
import { useKeysQuery } from "./queries/keys-query";
import { useJoinChat } from "./mutations";
import { NostrListenerQueriesProvider, NostrProvider } from "./nostr";
import { useListenMessagesQuery } from "./queries/listen-messages-query";

interface Context {
  showSpinner: boolean;
  revealPrivKey: boolean;
  chatPrivKey: string;
  receiverPubKey: string;
  hasUserJoinedChat: boolean;
  windowWidth: number;
  // TODO: it means is active usre removed from channe;
  isActiveUserRemoved: boolean;
  setRevealPrivKey: (d: boolean) => void;
  setShowSpinner: (d: boolean) => void;
  setChatPrivKey: (key: string) => void;
  setReceiverPubKey: (key: string) => void;
  setMessageServiceInstance: (instance: MessageService | null) => void;
}

interface Props {
  children: JSX.Element | JSX.Element[];
}

export const ChatContext = React.createContext<Context>({
  showSpinner: false,
  revealPrivKey: false,
  chatPrivKey: "",
  receiverPubKey: "",
  hasUserJoinedChat: false,
  windowWidth: 0,
  isActiveUserRemoved: false,
  setRevealPrivKey: () => {},
  setShowSpinner: () => {},
  setChatPrivKey: () => {},
  setReceiverPubKey: () => {},
  setMessageServiceInstance: () => {}
});

export const ChatContextProvider = (props: Props) => {
  const [showSpinner, setShowSpinner] = useState(true);
  const [chatPrivKey, setChatPrivKey] = useState("");
  const [revealPrivKey, setRevealPrivKey] = useState(false);
  const [receiverPubKey, setReceiverPubKey] = useState("");
  const [messageServiceInstance, setMessageServiceInstance] = useState<MessageService | null>(null);
  const [hasUserJoinedChat, setHasUserJoinedChat] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isActiveUserRemoved, setIsActiveUserRemoved] = useState(false);

  const { privateKey, publicKey } = useKeysQuery();

  useJoinChat(() => {
    setHasUserJoinedChat(true);
  });
  useListenMessagesQuery();

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
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <NostrListenerQueriesProvider>
      <ChatContext.Provider
        value={{
          showSpinner,
          revealPrivKey,
          receiverPubKey,
          chatPrivKey,
          hasUserJoinedChat,
          windowWidth,
          isActiveUserRemoved,
          setRevealPrivKey,
          setShowSpinner,
          setChatPrivKey,
          setReceiverPubKey,
          setMessageServiceInstance
        }}
      >
        <NostrProvider>{props.children}</NostrProvider>
      </ChatContext.Provider>
    </NostrListenerQueriesProvider>
  );
};
