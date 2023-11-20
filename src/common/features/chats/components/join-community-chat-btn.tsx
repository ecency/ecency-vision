import React, { useContext, useMemo } from "react";
import { History } from "history";
import { Community } from "../../../store/communities";
import { _t } from "../../../i18n";
import { useMappedStore } from "../../../store/use-mapped-store";
import { ChatContext } from "../chat-context-provider";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import {
  useAddCommunityChannel,
  useCreateCommunityChat,
  useLeaveCommunityChannel
} from "../mutations";
import {
  useChannelsQuery,
  useCommunityChannelQuery,
  useNostrJoinedCommunityTeamQuery
} from "../queries";
import { useLeftCommunityChannelsQuery } from "../queries/left-community-channels-query";
import { useKeysQuery } from "../queries/keys-query";

interface Props {
  history: History;
  community: Community;
}

export default function JoinCommunityChatBtn(props: Props) {
  const { publicKey } = useKeysQuery();
  const { hasUserJoinedChat } = useContext(ChatContext);
  const { activeUser } = useMappedStore();

  const { data: currentChannel } = useCommunityChannelQuery(props.community);
  const { data: channels } = useChannelsQuery();
  const { data: communityTeam } = useNostrJoinedCommunityTeamQuery(props.community);
  const { data: leftChannelsIds } = useLeftCommunityChannelsQuery();

  const { mutateAsync: addCommunityChannel, isLoading: isAddCommunityChannelLoading } =
    useAddCommunityChannel(currentChannel?.id);
  const { mutateAsync: createCommunityChat, isLoading: isCreateCommunityChatLoading } =
    useCreateCommunityChat(props.community);
  const { mutateAsync: leaveCommunityChannel, isLoading: isLeavingCommunityChannelLoading } =
    useLeaveCommunityChannel();

  const isChatEnabled = useMemo(() => !!currentChannel, [currentChannel]);
  const isCommunityChatJoined = useMemo(
    () =>
      channels?.some(
        (item) =>
          item.communityName === props.community.name &&
          !leftChannelsIds?.includes(currentChannel?.id!)
      ),
    [channels, leftChannelsIds]
  );

  const join = async () => {
    if (!hasUserJoinedChat) {
      return;
    }
    await addCommunityChannel();
  };

  return hasUserJoinedChat ? (
    <>
      {props.community.name === activeUser?.username ? (
        isCommunityChatJoined ? (
          <Button size="sm" appearance="secondary">
            {_t("chat.chat-joined")}
          </Button>
        ) : !isChatEnabled ? (
          <Button
            size="sm"
            onClick={async () => {
              if (communityTeam.some((role) => role.pubkey === publicKey)) {
                await createCommunityChat();
                await join();
              }
            }}
            disabled={isCreateCommunityChatLoading}
            icon={isCreateCommunityChatLoading && <Spinner />}
            iconPlacement="left"
          >
            {_t("chat.start-community-chat")}
          </Button>
        ) : !isCommunityChatJoined && isChatEnabled ? (
          <Button
            size="sm"
            disabled={isAddCommunityChannelLoading}
            to={`/chats/${props.community.name}`}
            icon={isAddCommunityChannelLoading && <Spinner className="w-3.5 h-3.5" />}
            iconPlacement="left"
          >
            {_t("chat.join-community-chat")}
          </Button>
        ) : (
          <></>
        )
      ) : isChatEnabled && !isCommunityChatJoined ? (
        <Button
          size="sm"
          disabled={isAddCommunityChannelLoading}
          to={`/chats/${props.community.name}`}
          icon={isAddCommunityChannelLoading && <Spinner className="w-3.5 h-3.5" />}
          iconPlacement="left"
        >
          {_t("community.join-community-chat")}
        </Button>
      ) : isCommunityChatJoined ? (
        <Button
          size="sm"
          appearance="secondary"
          disabled={isLeavingCommunityChannelLoading}
          icon={isLeavingCommunityChannelLoading && <Spinner className="w-3.5 h-3.5" />}
          onClick={() => leaveCommunityChannel(currentChannel!!.name)}
        >
          {_t("chat.chat-joined")}
        </Button>
      ) : (
        <></>
      )}
    </>
  ) : (
    <></>
  );
}
