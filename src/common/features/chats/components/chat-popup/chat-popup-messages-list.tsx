import { Link } from "react-router-dom";
import ChatsProfileBox from "../chat-profile-box";
import ChatsDirectMessages from "../chats-direct-messages";
import React from "react";
import { useCommunityCache } from "../../../../core";
import { ChatsChannelMessages } from "../chat-channel-messages";
import {
  Channel,
  DirectContact,
  DirectMessage,
  PublicMessage,
  useMessagesQuery
} from "@ecency/ns-query";

interface Props {
  currentContact?: DirectContact;
  currentChannel?: Channel;
}

export function ChatPopupMessagesList({ currentContact, currentChannel }: Props) {
  const { data: currentCommunity } = useCommunityCache(currentChannel?.name);
  const { data: messages } = useMessagesQuery(currentContact, currentChannel);

  return (
    <div className="chats h-full">
      {" "}
      <Link
        to={!!currentChannel ? `/created/${currentCommunity?.name}` : `/@${currentContact?.name}`}
      >
        <ChatsProfileBox communityName={currentChannel?.name} currentUser={currentContact?.name} />
      </Link>
      {!!currentChannel ? (
        <ChatsChannelMessages
          publicMessages={messages as PublicMessage[]}
          currentChannel={currentChannel!}
        />
      ) : (
        <ChatsDirectMessages
          directMessages={messages as DirectMessage[]}
          currentContact={currentContact!!}
        />
      )}
    </div>
  );
}
