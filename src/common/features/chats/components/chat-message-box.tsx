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

  const currentChannel = useMemo(
    () =>
      [...(channels ?? []), ...(communityChannel ? [communityChannel] : [])]?.find(
        (c) => c.communityName === community?.name
      ),
    [channels, community]
  );
  const hasCommunityChat = useMemo(() => !!currentChannel, [currentChannel]);
  const hasLeftCommunity = useMemo(
    () => leftCommunityChannelsIds?.includes(currentChannel?.id ?? ""),
    [currentChannel]
  );
  const isCommunityJoined = useMemo(
    () =>
      getJoinedCommunities(channels ?? [], leftChannelsIds ?? []).some(
        (channel) => channel.id === currentChannel?.id
      ),
    [channels, currentChannel, leftChannelsIds]
  );

  return (
    <div
      className="grid min-h-full"
      style={{
        gridTemplateRows: "min-content 1fr min-content"
      }}
    >
      {props.match.url === "/chats" ? (
        <div className="no-chat-select">
          <div className="start-chat-wrapper text-center ">
            <p className="start-chat ">Select a chat or start a new conversation</p>
          </div>
        </div>
      ) : (
        <>
          {props.match.params.username.startsWith("@") ||
          (hasCommunityChat && isCommunityJoined) ? (
            <>
              <ChatsMessagesHeader username={props.match.params.username} history={props.history} />
              {inProgress && <LinearProgress />}
              <ChatsMessagesView
                username={props.match.params.username}
                currentChannel={currentChannel!}
                setInProgress={setInProgress}
              />
            </>
          ) : hasCommunityChat && !isCommunityJoined ? (
            <>
              <div />
              <div className="flex flex-col justify-center items-center mb-4">
                <ChatsProfileBox communityName={community?.name} />
                <p className="mb-4 text-gray-600">
                  {hasLeftCommunity
                    ? "You have left this community chat. Rejoin the chat now!"
                    : " You are not part of this community. Join the community chat now!"}
                </p>
                <Button
                  onClick={() => addCommunityChannel()}
                  disabled={isAddCommunityChannelLoading}
                >
                  {hasLeftCommunity ? "Rejoin Community Chat" : "Join Community Chat"}
                </Button>
              </div>
              <div />
            </>
          ) : (
            <p className="no-chat-select">Community chat not started yet</p>
          )}
        </>
      )}
    </div>
  );
}
