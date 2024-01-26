import { Link } from "react-router-dom";
import ChatsProfileBox from "../chat-profile-box";
import ChatsDirectMessages from "../chats-direct-messages";
import React, { useEffect } from "react";
import { useCommunityCache } from "../../../../core";
import { ChatsChannelMessages } from "../chat-channel-messages";
import {
  Channel,
  DirectContact,
  DirectMessage,
  PublicMessage,
  useDirectContactsQuery,
  useMessagesQuery,
  useUpdateChannelLastSeenDate,
  useUpdateDirectContactsLastSeenDate
} from "@ecency/ns-query";

interface Props {
  currentContact?: DirectContact;
  currentChannel?: Channel;
}

export function ChatPopupMessagesList({ currentContact, currentChannel }: Props) {
  const { data: currentCommunity } = useCommunityCache(currentChannel?.communityName);
  const { data: messages } = useMessagesQuery(currentContact, currentChannel);
  const { isSuccess: isDirectContactsLoaded } = useDirectContactsQuery();

  const updateDirectContactsLastSeenDate = useUpdateDirectContactsLastSeenDate();
  const updateChannelLastSeenDate = useUpdateChannelLastSeenDate();

  // Whenever current contact is exists need to turn unread to 0
  useEffect(() => {
    if (currentContact && isDirectContactsLoaded) {
      updateDirectContactsLastSeenDate.mutateAsync({
        contact: currentContact,
        lastSeenDate: new Date()
      });
    }
  }, [currentContact, isDirectContactsLoaded]);

  useEffect(() => {
    if (currentChannel) {
      updateChannelLastSeenDate.mutateAsync({
        channel: currentChannel,
        lastSeenDate: new Date()
      });
    }
  }, [currentChannel]);

  return (
    <div className="chats h-full">
      {" "}
      <Link
        to={!!currentChannel ? `/created/${currentCommunity?.name}` : `/@${currentContact?.name}`}
      >
        <ChatsProfileBox
          communityName={currentChannel?.communityName}
          currentUser={currentContact?.name}
        />
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
