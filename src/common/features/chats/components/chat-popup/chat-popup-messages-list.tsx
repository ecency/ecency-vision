import { Link } from "react-router-dom";
import ChatsProfileBox from "../chat-profile-box";
import ChatsDirectMessages from "../chats-direct-messages";
import React, { useMemo } from "react";
import { DirectMessage, PublicMessage } from "../../managers/message-manager-types";
import { useChannelsQuery, useMessagesQuery } from "../../queries";
import { useCommunityCache } from "../../../../core";
import { ChatsChannelMessages } from "../chat-channel-messages";

interface Props {
  username: string;
}

export function ChatPopupMessagesList({ username }: Props) {
  const { data: currentCommunity } = useCommunityCache(username);
  const { data: messages } = useMessagesQuery(username);
  const { data: channels } = useChannelsQuery();
  const currentChannel = useMemo(
    () => channels?.find((channel) => channel.communityName === currentCommunity?.name),
    [channels, currentCommunity]
  );

  return (
    <div className="chats">
      {" "}
      <Link to={!!currentChannel ? `/created/${currentCommunity?.name}` : `/@${username}`}>
        <ChatsProfileBox communityName={username} currentUser={username} />
      </Link>
      {!!currentChannel ? (
        <ChatsChannelMessages
          publicMessages={messages as PublicMessage[]}
          currentChannel={currentChannel!}
          isScrollToBottom={false}
        />
      ) : (
        <ChatsDirectMessages
          directMessages={messages as DirectMessage[]}
          currentUser={username}
          isScrollToBottom={false}
        />
      )}
    </div>
  );
}
