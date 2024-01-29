import React, { useEffect, useMemo } from "react";
import { History } from "history";
import ChatsMessagesHeader from "./chat-messages-header";
import ChatsMessagesView from "./chat-messages-view";
import {
  Channel,
  DirectContact,
  useAutoScrollInChatBox,
  useDirectContactsQuery,
  useUpdateChannelLastSeenDate,
  useUpdateDirectContactsLastSeenDate
} from "@ecency/ns-query";
import { Community } from "../../../store/communities";
import { ChatInvitation } from "./chat-invitation";

interface MatchParams {
  filter: string;
  name: string;
  path: string;
  url: string;
  username: string;
}

interface Props {
  community?: Community | null;
  history: History;
  channel?: Channel;
  currentContact?: DirectContact;
}

export default function ChatsMessagesBox(props: Props) {
  const isContactJoined = useMemo(
    () => !!props.currentContact?.pubkey && !props.currentContact.pubkey.startsWith("not_joined_"),
    [props.currentContact]
  );

  const { isSuccess: isDirectContactsLoaded } = useDirectContactsQuery();
  const updateDirectContactsLastSeenDate = useUpdateDirectContactsLastSeenDate();
  const updateChannelLastSeenDate = useUpdateChannelLastSeenDate();

  useAutoScrollInChatBox(props.currentContact, props.channel);

  // Whenever current contact is exists need to turn unread to 0
  useEffect(() => {
    if (props.currentContact && isDirectContactsLoaded) {
      updateDirectContactsLastSeenDate.mutateAsync({
        contact: props.currentContact,
        lastSeenDate: new Date()
      });
    }
  }, [props.currentContact, isDirectContactsLoaded]);

  useEffect(() => {
    if (props.channel) {
      updateChannelLastSeenDate.mutateAsync({
        channel: props.channel,
        lastSeenDate: new Date()
      });
    }
  }, [props.channel]);

  return (
    <div
      className="grid min-h-full"
      style={{
        gridTemplateRows: "min-content 1fr min-content"
      }}
    >
      <ChatsMessagesHeader
        channel={props.channel}
        username={props.community?.name ?? props.currentContact?.name ?? ""}
        history={props.history}
      />
      {!props.currentContact || isContactJoined ? (
        <ChatsMessagesView
          currentContact={props.currentContact!!}
          currentChannel={props.channel!!}
        />
      ) : (
        <ChatInvitation currentContact={props.currentContact} />
      )}
    </div>
  );
}
