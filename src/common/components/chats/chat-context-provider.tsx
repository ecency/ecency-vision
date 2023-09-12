import React, { useEffect, useState } from "react";
import { Keys } from "../../../managers/message-manager-types";
import MessageService from "../../helper/message-service";
import { useMappedStore } from "../../store/use-mapped-store";
import { NostrKeysType } from "./types";
import { getPrivateKey, getUserChatPublicKey } from "./utils";

interface Context {
  activeUserKeys?: NostrKeysType;
  inProgress: boolean;
  revealPrivKey: boolean;
  chatPrivKey: string;
  receiverPubKey: string;
  messageServiceInstance: MessageService | undefined;
  setRevealPrivKey: (d: boolean) => void;
  setInProgress: (d: boolean) => void;
  setChatPrivKey: (key: string) => void;
  setActiveUserKeys: (keys: NostrKeysType) => void;
  setReceiverPubKey: (key: string) => void;

  setMessageServiceInstance: (instance: MessageService | undefined) => void;
  initMessageServiceInstance: (keys: Keys) => void;
}

interface Props {
  children: JSX.Element | JSX.Element[];
}

export const ChatContext = React.createContext<Context>({
  activeUserKeys: { pub: " ", priv: "" },
  inProgress: false,
  revealPrivKey: false,
  chatPrivKey: "",
  receiverPubKey: "",
  messageServiceInstance: undefined,
  setRevealPrivKey: () => {},
  setInProgress: () => {},
  setChatPrivKey: () => {},
  setActiveUserKeys: () => {},
  setReceiverPubKey: () => {},
  setMessageServiceInstance: () => {},
  initMessageServiceInstance: () => {}
});

export default function ChatContextProvider({ children }: Props) {
  const { activeUser } = useMappedStore();

  const [activeUserKeys, setActiveUserKeys] = useState<NostrKeysType>();
  const [inProgress, setInProgress] = useState(true);
  const [chatPrivKey, setChatPrivKey] = useState("");
  const [revealPrivKey, setRevealPrivKey] = useState(false);
  const [receiverPubKey, setReceiverPubKey] = useState("");
  const [messageServiceInstance, setMessageServiceInstance] = useState<MessageService | undefined>(
    undefined
  );

  useEffect(() => {
    getActiveUserKeys();
  }, []);

  useEffect(() => {
    if (messageServiceInstance) {
      console.log("messageServiceInstance in context", messageServiceInstance);
    }
  }, [messageServiceInstance]);

  useEffect(() => {
    if (inProgress) {
      setTimeout(() => {
        setInProgress(false);
      }, 7000);
    }
  }, [inProgress]);

  const getActiveUserKeys = async () => {
    const pubKey = await getUserChatPublicKey(activeUser?.username!);
    const privKey = getPrivateKey(activeUser?.username!);
    setChatPrivKey(privKey);
    const activeUserKeys = {
      pub: pubKey,
      priv: privKey
    };
    setInProgress(false);
    setActiveUserKeys(activeUserKeys);
  };

  const initMessageServiceInstance = (keys: Keys) => {
    console.log("Keys are in context", keys, messageServiceInstance);
    if (messageServiceInstance) {
      messageServiceInstance.close();
      setMessageServiceInstance(undefined);
    }

    let newMessageService: MessageService | undefined = undefined;
    if (keys) {
      newMessageService = new MessageService(keys.priv, keys.pub);
      console.log("raven instance created", newMessageService);
      setMessageServiceInstance(newMessageService);
    }
    return newMessageService;
  };

  return (
    <ChatContext.Provider
      value={{
        activeUserKeys,
        inProgress,
        revealPrivKey,
        receiverPubKey,
        chatPrivKey,
        messageServiceInstance,
        setRevealPrivKey,
        setInProgress,
        setChatPrivKey,
        setActiveUserKeys,
        setReceiverPubKey,
        setMessageServiceInstance,
        initMessageServiceInstance
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
