import React, { useContext, useEffect } from "react";
import { useMappedStore } from "../../../store/use-mapped-store";

import { ChatContext } from "../chat-provider";
import { getPrivateKey, getUserChatPublicKey } from "../utils";

export default function SetActiveUserChatKeys() {
  const context = useContext(ChatContext);
  const { setActiveUserKeys, setChatPrivKey } = context;
  const { activeUser } = useMappedStore();

  useEffect(() => {
    getActiveUserKeys();
  }, []);

  const getActiveUserKeys = async () => {
    const pubKey = await getUserChatPublicKey(activeUser?.username!);
    const privKey = getPrivateKey(activeUser?.username!);
    const keys = {
      pub: pubKey,
      priv: privKey
    };
    setChatPrivKey(privKey);
    setActiveUserKeys(keys);
  };

  return <></>;
}
