import React, { useContext, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useMappedStore } from "../../../store/use-mapped-store";
import { ChatContext } from "../chat-context-provider";
import { createNoStrAccount, setProfileMetaData } from "../utils";

import * as ls from "../../../util/local-storage";
import { setNostrkeys } from "../../../../managers/message-manager";

interface Props {
  resetChat: () => void;
}

export default function JoinChat(props: Props) {
  const { messageServiceInstance, setChatPrivKey, setActiveUserKeys } = useContext(ChatContext);

  const { activeUser } = useMappedStore();

  const [showSpinner, setShowSpinner] = useState(false);

  const handleJoinChat = async () => {
    const { resetChat } = props;
    setShowSpinner(true);
    resetChat();
    const keys = createNoStrAccount();
    ls.set(`${activeUser?.username}_nsPrivKey`, keys.priv);
    setChatPrivKey(keys.priv);
    await setProfileMetaData(activeUser, keys.pub);
    setNostrkeys(keys);
    messageServiceInstance?.updateProfile({
      name: activeUser?.username!,
      about: "",
      picture: ""
    });
    setActiveUserKeys(keys);
    setShowSpinner(false);
  };

  return (
    <div className="no-chat text-center">
      <p>You haven't joined the chat yet. Please join the chat to start chatting.</p>
      <Button onClick={handleJoinChat}>
        {showSpinner && (
          <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
        )}
        Join Chat
      </Button>
    </div>
  );
}
