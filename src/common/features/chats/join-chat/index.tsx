import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../chat-context-provider";
import { Button } from "@ui/button";
import { Spinner } from "@ui/spinner";
import { _t } from "../../../i18n";

export default function JoinChat() {
  const { messageServiceInstance, joinChat } = useContext(ChatContext);

  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (messageServiceInstance) {
      setShowSpinner(false);
    }
  }, [messageServiceInstance]);

  const handleJoinChat = async () => {
    setShowSpinner(true);
    joinChat();
  };

  return (
    <div className="no-chat text-center">
      <p>{_t("chat.you-haven-t-joined")}</p>
      <Button
        onClick={handleJoinChat}
        icon={showSpinner ? <Spinner /> : <></>}
        iconPlacement="left"
      >
        {_t("chat.join-chat")}
      </Button>
    </div>
  );
}
