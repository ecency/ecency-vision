import React from "react";
import { _t } from "../../../i18n";
import { Button } from "@ui/button";
import { Channel, useAddCommunityChannel } from "@ecency/ns-query";
import { Spinner } from "@ui/spinner";

interface Props {
  channel: Channel;
}

export function ChatChannelNotJoined({ channel }: Props) {
  const { mutateAsync: addCommunityChannel, isLoading: isAddCommunityChannelLoading } =
    useAddCommunityChannel(channel);
  return (
    <div className="h-[56px] flex items-center justify-between px-3 gap-4">
      <span className="text-xs">{_t("chat.welcome.join-description")}</span>
      <Button
        disabled={isAddCommunityChannelLoading}
        icon={isAddCommunityChannelLoading && <Spinner className="w-3.5 h-3.5" />}
        className="whitespace-nowrap"
        size="sm"
        onClick={() => addCommunityChannel()}
      >
        {_t("chat.join-channel")}
      </Button>
    </div>
  );
}
