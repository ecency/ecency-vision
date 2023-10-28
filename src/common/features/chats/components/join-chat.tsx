import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../chat-context-provider";
import { Button } from "@ui/button";
import { Spinner } from "@ui/spinner";
import { _t } from "../../../i18n";
import { useJoinChat } from "../mutations/join-chat";

export default function JoinChat() {
  const { messageServiceInstance } = useContext(ChatContext);
  const { mutateAsync: joinChat } = useJoinChat();

  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (messageServiceInstance) {
      setShowSpinner(false);
    }
  }, [messageServiceInstance]);

  return (
    <div className="no-chat text-center">
      <p>{_t("chat.you-haven-t-joined")}</p>
      <Button
        onClick={() => {
          setShowSpinner(true);
          joinChat();
        }}
        icon={showSpinner ? <Spinner /> : <></>}
        iconPlacement="left"
      >
        {_t("chat.join-chat")}
      </Button>
    </div>
  );
}
