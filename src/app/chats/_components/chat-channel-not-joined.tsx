import React from "react";
import { Button } from "@ui/button";
import { Channel, useAddCommunityChannel } from "@ecency/ns-query";
import { Spinner } from "@ui/spinner";
import i18next from "i18next";

interface Props {
  channel: Channel;
}

export function ChatChannelNotJoined({ channel }: Props) {
  const { mutateAsync: addCommunityChannel, isPending: isAddCommunityChannelLoading } =
    useAddCommunityChannel(channel);
  return (
    <div className="h-[56px] flex items-center justify-between px-3 gap-4">
      <span className="text-xs">{i18next.t("chat.welcome.join-description")}</span>
      <Button
        disabled={isAddCommunityChannelLoading}
        icon={isAddCommunityChannelLoading && <Spinner className="w-3.5 h-3.5" />}
        className="whitespace-nowrap"
        size="sm"
        onClick={() => addCommunityChannel()}
      >
        {i18next.t("chat.join-channel")}
      </Button>
    </div>
  );
}
