import React, { useContext, useMemo } from "react";
import { History } from "history";
import { Community } from "../../../store/communities";
import { _t } from "../../../i18n";
import { useMappedStore } from "../../../store/use-mapped-store";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import {
  ChatContext,
  useAddCommunityChannel,
  useChannelsQuery,
  useCommunityChannelQuery,
  useCreateCommunityChat,
  useKeysQuery,
  useLeaveCommunityChannel,
  useLeftCommunityChannelsQuery,
  useNostrJoinedCommunityTeamQuery
} from "@ecency/ns-query";
import { useGetAccountFullQuery, useGetAccountsFullQuery } from "../../../api/queries";
import { updateProfile } from "../../../api/operations";

interface Props {
  history: History;
  community: Community;
}

export default function JoinCommunityChatBtn(props: Props) {
  const { publicKey } = useKeysQuery();
  const { hasUserJoinedChat } = useContext(ChatContext);
  const { activeUser } = useMappedStore();

  const { data: communityAccount, isLoading: isCommunityAccountLoading } = useGetAccountFullQuery(
    props.community.name
  );
  const communityTeamQueries = useGetAccountsFullQuery(
    props.community.team.map(([name, role]) => name)
  );
  const { data: currentChannel, isLoading: isCurrentChannelLoading } = useCommunityChannelQuery(
    props.community
  );
  const { data: channels, isLoading: isChannelsLoading } = useChannelsQuery();
  const { data: communityTeam, isLoading: isCommunityTeamLoading } =
    useNostrJoinedCommunityTeamQuery(
      props.community,
      communityAccount!!,
      communityTeamQueries.map((query) => query.data!!)
    );
  const { data: leftChannelsIds, isLoading: isChannelsIdsLoading } =
    useLeftCommunityChannelsQuery();

  const { mutateAsync: addCommunityChannel, isLoading: isAddCommunityChannelLoading } =
    useAddCommunityChannel(currentChannel);
  const { mutateAsync: createCommunityChat, isLoading: isCreateCommunityChatLoading } =
    useCreateCommunityChat(props.community, communityAccount!!, updateProfile);
  const { mutateAsync: leaveCommunityChannel, isLoading: isLeavingCommunityChannelLoading } =
    useLeaveCommunityChannel();

  const isGlobalLoading = useMemo(
    () =>
      isChannelsLoading ||
      isChannelsIdsLoading ||
      isCommunityAccountLoading ||
      isCommunityTeamLoading,
    [isChannelsLoading, isChannelsIdsLoading, isCommunityAccountLoading, isCommunityTeamLoading]
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
  // Todo: all admin team should be able to create a channel
  //      Upd: only community owner could create a channel because it requires Nostr private key
  const isAbleToCreateChannel = useMemo(
    () => props.community.name === activeUser?.username,
    [activeUser, props.community]
  );

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
          onClick={() => leaveCommunityChannel(currentChannel!!.name)}
        >
          {_t("chat.chat-joined")}
        </Button>
      )}
      {!isCommunityChannelJoined && (
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
      )}
    </>
  );
}
