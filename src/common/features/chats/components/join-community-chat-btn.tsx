import React, { useContext, useMemo } from "react";
import { History } from "history";
import { Community } from "../../../store/communities";
import { _t } from "../../../i18n";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import {
  ChatContext,
  useAddCommunityChannel,
  useChannelsQuery,
  useCommunityChannelQuery,
  useCreateCommunityChat,
  useLeaveCommunityChannel,
  useLeftCommunityChannelsQuery
} from "@ecency/ns-query";
import { useMappedStore } from "../../../store/use-mapped-store";

interface Props {
  history: History;
  community: Community;
}

export default function JoinCommunityChatBtn(props: Props) {
  const { hasUserJoinedChat } = useContext(ChatContext);
  const { data: currentChannel, isLoading: isCurrentChannelLoading } = useCommunityChannelQuery(
    props.community
  );
  const { activeUser } = useMappedStore();
  const { data: channels } = useChannelsQuery();
  const { data: leftChannelsIds, isLoading: isChannelsIdsLoading } =
    useLeftCommunityChannelsQuery();

  const { mutateAsync: addCommunityChannel, isLoading: isAddCommunityChannelLoading } =
    useAddCommunityChannel(currentChannel);
  const { mutateAsync: createCommunityChat, isLoading: isCreateCommunityChatLoading } =
    useCreateCommunityChat(props.community);
  const { mutateAsync: leaveCommunityChannel, isLoading: isLeavingCommunityChannelLoading } =
    useLeaveCommunityChannel(currentChannel);

  const isGlobalLoading = useMemo(
    () => isChannelsIdsLoading || isCurrentChannelLoading,
    [isChannelsIdsLoading, isCurrentChannelLoading]
  );
  const isCommunityChannelCreated = useMemo(() => !!currentChannel, [currentChannel]);
  const isCommunityChannelJoined = useMemo(
    () =>
      channels?.some(
        (item) =>
          item.communityName === props.community.name &&
          !leftChannelsIds?.includes(currentChannel?.id!)
      ),
    [channels, leftChannelsIds]
  );

  // For now only Ecency official account able to start community channels
  const isAbleToCreateChannel = useMemo(() => activeUser?.username === "ecency", [activeUser]);

  const join = async () => {
    if (!hasUserJoinedChat) {
      return;
    }
    await addCommunityChannel();
  };

  return isGlobalLoading ? (
    <></>
  ) : (
    <>
      {isCommunityChannelJoined && (
        <Button
          size="sm"
          appearance="secondary"
          disabled={isLeavingCommunityChannelLoading}
          icon={isLeavingCommunityChannelLoading && <Spinner className="w-3.5 h-3.5" />}
          onClick={() => leaveCommunityChannel()}
        >
          {_t("chat.chat-joined")}
        </Button>
      )}
      {!isCommunityChannelJoined && isCommunityChannelCreated && (
        <Button
          size="sm"
          disabled={isAddCommunityChannelLoading}
          to={`/chats/${props.community.name}/channel`}
          iconPlacement="left"
        >
          {_t("chat.join-community-chat")}
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
          {_t("chat.start-community-chat")}
        </Button>
      )}
    </>
  );
}
