import React, { useEffect, useState } from "react";
import { Keys } from "../../../managers/message-manager-types";
import MessageService from "../../helper/message-service";
import { useMappedStore } from "../../store/use-mapped-store";
import { NostrKeysType } from "./types";
import {
  createNoStrAccount,
  getPrivateKey,
  getUserChatPublicKey,
  setProfileMetaData
} from "./utils";
import * as ls from "../../util/local-storage";
import { setNostrkeys } from "../../../managers/message-manager";

interface Context {
  activeUserKeys: NostrKeysType;
  showSpinner: boolean;
  revealPrivKey: boolean;
  chatPrivKey: string;
  receiverPubKey: string;
  messageServiceInstance: MessageService | undefined;
  hasUserJoinedChat: boolean;
  setRevealPrivKey: (d: boolean) => void;
  setShowSpinner: (d: boolean) => void;
  setChatPrivKey: (key: string) => void;
  setActiveUserKeys: (keys: NostrKeysType) => void;
  setReceiverPubKey: (key: string) => void;
  setMessageServiceInstance: (instance: MessageService | undefined) => void;
  initMessageServiceInstance: (keys: Keys) => void;
  joinChat: () => void;
}

interface Props {
  children: JSX.Element | JSX.Element[];
  resetChat: () => void;
}

export const ChatContext = React.createContext<Context>({
  activeUserKeys: { pub: " ", priv: "" },
  showSpinner: false,
  revealPrivKey: false,
  chatPrivKey: "",
  receiverPubKey: "",
  messageServiceInstance: undefined,
  hasUserJoinedChat: false,
  setRevealPrivKey: () => {},
  setShowSpinner: () => {},
  setChatPrivKey: () => {},
  setActiveUserKeys: () => {},
  setReceiverPubKey: () => {},
  setMessageServiceInstance: () => {},
  initMessageServiceInstance: () => {},
  joinChat: () => {}
});

export default function ChatContextProvider(props: Props) {
  const { activeUser } = useMappedStore();

  const [activeUserKeys, setActiveUserKeys] = useState<NostrKeysType>({ pub: " ", priv: "" });
  const [showSpinner, setShowSpinner] = useState(true);
  const [chatPrivKey, setChatPrivKey] = useState("");
  const [revealPrivKey, setRevealPrivKey] = useState(false);
  const [receiverPubKey, setReceiverPubKey] = useState("");
  const [messageServiceInstance, setMessageServiceInstance] = useState<MessageService | undefined>(
    undefined
  );
  const [hasUserJoinedChat, setHasUserJoinedChat] = useState(false);
  const [shouldUpdateProfile, setShouldUpdateProfile] = useState(false);

  useEffect(() => {
    getActiveUserKeys();
  }, []);

  useEffect(() => {
    if (messageServiceInstance) {
      getActiveUserKeys();
      setShouldUpdateProfile(false);
    }
  }, [messageServiceInstance]);

  useEffect(() => {
    if (shouldUpdateProfile && messageServiceInstance) {
      messageServiceInstance.updateProfile({
        name: activeUser?.username!,
        about: "",
        picture: ""
      });
    }
  }, [shouldUpdateProfile, messageServiceInstance]);

  useEffect(() => {
    if (showSpinner) {
      setTimeout(() => {
        setShowSpinner(false);
      }, 6000);
    }
  }, [showSpinner]);

  const getActiveUserKeys = async () => {
    const pubKey = await getUserChatPublicKey(activeUser?.username!);
    const privKey = getPrivateKey(activeUser?.username!);
    setHasUserJoinedChat(!!pubKey);
    setChatPrivKey(privKey);
    const activeUserKeys = {
      pub: pubKey,
      priv: privKey
    };
    setActiveUserKeys(activeUserKeys);
  };

  const initMessageServiceInstance = (keys: Keys) => {
    if (messageServiceInstance) {
      messageServiceInstance.close();
      setMessageServiceInstance(undefined);
    }

    let newMessageService: MessageService | undefined = undefined;
    if (keys) {
      newMessageService = new MessageService(keys.priv, keys.pub);
      setMessageServiceInstance(newMessageService);
    }
    return newMessageService;
  };

  const joinChat = async () => {
    console.log("Join chat run in context");
    const { resetChat } = props;
    resetChat();
    const keys = createNoStrAccount();
    ls.set(`${activeUser?.username}_nsPrivKey`, keys.priv);
    await setProfileMetaData(activeUser, keys.pub);
    setHasUserJoinedChat(true);
    setNostrkeys(keys);
    setChatPrivKey(keys.priv);
    setShouldUpdateProfile(true);
    setActiveUserKeys(keys);
  };

  return (
    <ChatContext.Provider
      value={{
        activeUserKeys,
        showSpinner,
        revealPrivKey,
        receiverPubKey,
        chatPrivKey,
        messageServiceInstance,
        hasUserJoinedChat,
        setRevealPrivKey,
        setShowSpinner,
        setChatPrivKey,
        setActiveUserKeys,
        setReceiverPubKey,
        setMessageServiceInstance,
        initMessageServiceInstance,
        joinChat
      }}
    >
      {props.children}
    </ChatContext.Provider>
  );
}
