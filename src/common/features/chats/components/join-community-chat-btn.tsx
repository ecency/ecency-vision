import React, { useMemo } from "react";
import { History } from "history";
import { Community } from "../../../store/communities";
import { _t } from "../../../i18n";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { useCommunityChannelQuery, useCreateCommunityChat } from "@ecency/ns-query";
import { useMappedStore } from "../../../store/use-mapped-store";
import { messageSendSvg } from "../../../img/svg";

interface Props {
  history: History;
  community: Community;
}

export default function JoinCommunityChatBtn(props: Props) {
  const { data: currentChannel, isLoading: isCurrentChannelLoading } = useCommunityChannelQuery(
    props.community
  );
  const { activeUser } = useMappedStore();

  const { mutateAsync: createCommunityChat, isLoading: isCreateCommunityChatLoading } =
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
          to={`/chats/${props.community.name}/channel`}
          iconPlacement="left"
          icon={messageSendSvg}
        >
          {_t("chat.view-community-channel")}
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
          {_t("chat.start-community-channel")}
        </Button>
      )}
    </>
  );
}
