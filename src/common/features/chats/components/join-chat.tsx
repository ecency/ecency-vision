import React from "react";
import { Button } from "@ui/button";
import { Spinner } from "@ui/spinner";
import { _t } from "../../../i18n";
import { useJoinChat } from "../mutations";

export default function JoinChat() {
  const { mutateAsync: joinChat, isLoading } = useJoinChat();

  return (
    <div className="no-chat text-center">
      <p>{_t("chat.you-haven-t-joined")}</p>
      <Button
        onClick={() => joinChat()}
        disabled={isLoading}
        icon={isLoading ? <Spinner /> : <></>}
        iconPlacement="left"
      >
        {_t("chat.join-chat")}
      </Button>
    </div>
  );
}
