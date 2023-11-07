import React, { useContext, useMemo } from "react";
import { History } from "history";
import { Community } from "../../../store/communities";
import { _t } from "../../../i18n";
import { useMappedStore } from "../../../store/use-mapped-store";
import { ChatContext } from "../chat-context-provider";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { useAddCommunityChannel, useCreateCommunityChat, useJoinChat } from "../mutations";
import {
  useChannelsQuery,
  useCommunityChannelQuery,
  useNostrJoinedCommunityTeamQuery
} from "../queries";
import { useLeftCommunityChannelsQuery } from "../queries/left-community-channels-query";

interface Props {
  history: History;
  community: Community;
}

export default function JoinCommunityChatBtn(props: Props) {
  const { messageServiceInstance, activeUserKeys, hasUserJoinedChat } = useContext(ChatContext);
  const { chat, activeUser } = useMappedStore();

  const { data: currentChannel } = useCommunityChannelQuery(props.community);
  const { data: channels } = useChannelsQuery();
  const { data: communityTeam } = useNostrJoinedCommunityTeamQuery(props.community);

  const { mutateAsync: addCommunityChannel, isLoading: isAddCommunityChannelLoading } =
    useAddCommunityChannel(currentChannel?.id);
  const { mutateAsync: joinChat, isLoading: isJoinChatLoading } = useJoinChat();
  const { mutateAsync: createCommunityChat, isLoading: isCreateCommunityChatLoading } =
    useCreateCommunityChat(props.community);
  const { data: leftChannelsIds } = useLeftCommunityChannelsQuery();

  const isChatEnabled = useMemo(() => !!currentChannel, [currentChannel]);
  const isCommunityChatJoined = useMemo(
    () =>
      channels?.some(
        (item) =>
          item.communityName === props.community.name &&
          leftChannelsIds?.includes(currentChannel?.id!)
      ),
    [channels]
  );

  const join = async () => {
    if (!hasUserJoinedChat) {
      await joinChat();
    }
    // TODO: need to write it as query and mutation that if we left the chat then re-join again
    if (chat.leftChannelsList.includes(currentChannel?.id!)) {
      messageServiceInstance?.updateLeftChannelList(
        chat.leftChannelsList.filter((x) => x !== currentChannel?.id)
      );
    }
    await addCommunityChannel();
  };

  return (
    <>
      {props.community.name === activeUser?.username ? (
        isCommunityChatJoined ? (
          <Button outline={true}>{_t("chat.chat-joined")}</Button>
        ) : !isChatEnabled ? (
          <Button
            onClick={async () => {
              if (!hasUserJoinedChat) {
                await joinChat();
              }

              if (communityTeam.some((role) => role.pubkey === activeUserKeys.pub)) {
                await createCommunityChat();
                await join();
              }
            }}
            disabled={isCreateCommunityChatLoading || isJoinChatLoading}
            icon={isCreateCommunityChatLoading || isJoinChatLoading ? <Spinner /> : <></>}
            iconPlacement="left"
          >
            {_t("chat.start-community-chat")}
          </Button>
        ) : !isCommunityChatJoined && isChatEnabled && hasUserJoinedChat ? (
          <Button
            disabled={isJoinChatLoading || isAddCommunityChannelLoading}
            onClick={join}
            icon={isJoinChatLoading ? <Spinner /> : <></>}
            iconPlacement="left"
          >
            {_t("chat.join-community-chat")}
          </Button>
        ) : (
          <></>
        )
      ) : isChatEnabled && !isCommunityChatJoined ? (
        <Button
          disabled={isJoinChatLoading || isAddCommunityChannelLoading}
          onClick={join}
          icon={isJoinChatLoading ? <Spinner /> : <></>}
          iconPlacement="left"
        >
          {_t("community.join-community-chat")}
        </Button>
      ) : isCommunityChatJoined ? (
        <Button outline={true}>{_t("chat.chat-joined")}</Button>
      ) : (
        <></>
      )}
    </>
  );
}
