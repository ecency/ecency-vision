import React, { useEffect, useState } from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import { NostrKeysType } from "./types";
import { getPrivateKey, getUserChatPublicKey } from "./utils";

interface Context {
  activeUserKeys?: NostrKeysType;
  inProgress: boolean;
  revealPrivKey: boolean;
  chatPrivKey: string;
  receiverPubKey: string;
  setRevealPrivKey: (d: boolean) => void;
  setInProgress: (d: boolean) => void;
  setChatPrivKey: (key: string) => void;
  setActiveUserKeys: (keys: NostrKeysType) => void;
  setReceiverPubKey: (key: string) => void;
}

interface ChatProviderProps {
  children: (context: Context) => React.ReactNode;
}

export const ChatContext = React.createContext<Context>({
  activeUserKeys: { pub: " ", priv: "" },
  inProgress: false,
  revealPrivKey: false,
  chatPrivKey: "",
  receiverPubKey: "",
  setRevealPrivKey: () => {},
  setInProgress: () => {},
  setChatPrivKey: () => {},
  setActiveUserKeys: () => {},
  setReceiverPubKey: () => {}
});

export default function ChatProvider({ children }: ChatProviderProps) {
  const { activeUser } = useMappedStore();

  const [activeUserKeys, setActiveUserKeys] = useState<NostrKeysType>();
  const [inProgress, setInProgress] = useState(true);
  const [chatPrivKey, setChatPrivKey] = useState("");
  const [receiverPubKey, setReceiverPubKey] = useState("");
  const [revealPrivKey, setRevealPrivKey] = useState(false);

  useEffect(() => {
    getActiveUserKeys();
  }, []);

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

  return (
    <ChatContext.Provider
      value={{
        activeUserKeys,
        inProgress,
        revealPrivKey,
        chatPrivKey,
        receiverPubKey,
        setRevealPrivKey,
        setInProgress,
        setChatPrivKey,
        setActiveUserKeys,
        setReceiverPubKey
      }}
    >
      {children({
        activeUserKeys,
        inProgress,
        revealPrivKey,
        chatPrivKey,
        receiverPubKey,
        setRevealPrivKey,
        setInProgress,
        setChatPrivKey,
        setActiveUserKeys,
        setReceiverPubKey
      })}
    </ChatContext.Provider>
  );
}
