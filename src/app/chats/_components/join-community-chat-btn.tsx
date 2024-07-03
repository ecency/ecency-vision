import React, { useMemo } from "react";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { useCommunityChannelQuery, useCreateCommunityChat } from "@ecency/ns-query";
import { Community } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { messageSendSvg } from "@/assets/img/svg";
import i18next from "i18next";

interface Props {
  community: Community;
}

export function JoinCommunityChatBtn(props: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const { data: currentChannel, isLoading: isCurrentChannelLoading } = useCommunityChannelQuery(
    props.community
  );

  const { mutateAsync: createCommunityChat, isPending: isCreateCommunityChatLoading } =
    useCreateCommunityChat(props.community);
  const isCommunityChannelCreated = useMemo(() => !!currentChannel, [currentChannel]);

  // For now only Ecency official account able to start community channels
  const isAbleToCreateChannel = useMemo(() => activeUser?.username === "ecency", [activeUser]);

  return isCurrentChannelLoading ? (
    <></>
  ) : (
    <>
      {isCommunityChannelCreated && (
        <Button
          size="sm"
          href={`/chats/${props.community.name}/channel`}
          iconPlacement="left"
          icon={messageSendSvg}
        >
          {i18next.t("chat.view-community-channel")}
        </Button>
      )}
      {!isCommunityChannelCreated && isAbleToCreateChannel && (
        <Button
          size="sm"
          onClick={() => createCommunityChat()}
          disabled={isCreateCommunityChatLoading}
          icon={isCreateCommunityChatLoading && <Spinner />}
          iconPlacement="left"
        >
          {i18next.t("chat.start-community-channel")}
        </Button>
      )}
    </>
  );
}
