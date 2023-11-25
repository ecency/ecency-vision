import React, { useMemo, useState } from "react";
import { match } from "react-router";
import { History } from "history";
import ChatsMessagesHeader from "./chat-messages-header";
import ChatsMessagesView from "./chat-messages-view";
import LinearProgress from "../../../components/linear-progress";
import { getJoinedCommunities } from "../utils";
import { Button } from "@ui/button";
import { useChannelsQuery, useCommunityChannelQuery } from "../queries";
import { useLeftCommunityChannelsQuery } from "../queries/left-community-channels-query";
import { useCommunityCache } from "../../../core";
import { useAddCommunityChannel } from "../mutations";
import ChatsProfileBox from "./chat-profile-box";
import { useAutoScrollInChatBox } from "../hooks";
import { Channel } from "../nostr";
import { _t } from "../../../i18n";

interface MatchParams {
  filter: string;
  name: string;
  path: string;
  url: string;
  username: string;
}

interface Props {
  match: match<MatchParams>;
  history: History;
  channel: Channel;
}

export default function ChatsMessagesBox(props: Props) {
  useAutoScrollInChatBox(props.match.params.username);

  const { data: community } = useCommunityCache(props.match.params.username);

  const { data: channels } = useChannelsQuery();
  const { data: leftChannelsIds } = useLeftCommunityChannelsQuery();
  const { data: communityChannel } = useCommunityChannelQuery(community ?? undefined);
  const { data: leftCommunityChannelsIds } = useLeftCommunityChannelsQuery();

  const { mutateAsync: addCommunityChannel, isLoading: isAddCommunityChannelLoading } =
    useAddCommunityChannel(communityChannel?.id);

  const [inProgress, setInProgress] = useState(false);

  const hasLeftCommunity = useMemo(
    () => leftCommunityChannelsIds?.includes(props.channel?.id ?? ""),
    [props.channel]
  );
  const isCommunityJoined = useMemo(
    () =>
      getJoinedCommunities(channels ?? [], leftChannelsIds ?? []).some(
        (channel) => channel.id === props.channel?.id
      ),
    [channels, props.channel, leftChannelsIds]
  );

  return (
    <div
      className="grid min-h-full"
      style={{
        gridTemplateRows: "min-content 1fr min-content"
      }}
    >
      {props.match.params.username.startsWith("@") || isCommunityJoined ? (
        <>
          <ChatsMessagesHeader username={props.match.params.username} history={props.history} />
          {inProgress && <LinearProgress />}
          <ChatsMessagesView
            username={props.match.params.username}
            currentChannel={props.channel}
            setInProgress={setInProgress}
          />
        </>
      ) : (
        <>
          <div />
          <div className="flex flex-col justify-center items-center mb-4">
            <ChatsProfileBox communityName={community?.name} />
            <p className="mb-4 text-gray-600">
              {hasLeftCommunity
                ? _t("chat.welcome.rejoin-description")
                : _t("chat.welcome.join-description")}
            </p>
            <Button onClick={() => addCommunityChannel()} disabled={isAddCommunityChannelLoading}>
              {hasLeftCommunity ? "Rejoin Community Chat" : "Join Community Chat"}
            </Button>
          </div>
          <div />
        </>
      )}
    </div>
  );
}