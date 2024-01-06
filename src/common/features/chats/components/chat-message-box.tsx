import React, { useMemo } from "react";
import { History } from "history";
import ChatsMessagesHeader from "./chat-messages-header";
import ChatsMessagesView from "./chat-messages-view";
import { Button } from "@ui/button";
import ChatsProfileBox from "./chat-profile-box";
import { _t } from "../../../i18n";
import {
  Channel,
  DirectContact,
  useAddCommunityChannel,
  useAutoScrollInChatBox,
  useLeftCommunityChannelsQuery
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
  const { data: leftCommunityChannelsIds } = useLeftCommunityChannelsQuery();

  const { mutateAsync: addCommunityChannel, isLoading: isAddCommunityChannelLoading } =
    useAddCommunityChannel(props.channel);

  const hasLeftCommunity = useMemo(
    () => leftCommunityChannelsIds?.includes(props.channel?.id ?? ""),
    [props.channel]
  );
  const isContactJoined = useMemo(
    () => !!props.currentContact?.pubkey && !props.currentContact.pubkey.startsWith("not_joined_"),
    [props.currentContact]
  );

  useAutoScrollInChatBox(props.currentContact, props.channel);

  return (
    <div
      className="grid min-h-full"
      style={{
        gridTemplateRows: "min-content 1fr min-content"
      }}
    >
      {(props.channel && !hasLeftCommunity) || props.currentContact ? (
        <>
          <ChatsMessagesHeader
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
        </>
      ) : (
        <>
          <div />
          <div className="flex flex-col justify-center items-center mb-4">
            <ChatsProfileBox communityName={props.community?.name} />
            <p className="mb-4 text-gray-600">{_t("chat.welcome.join-description")}</p>
            <Button onClick={() => addCommunityChannel()} disabled={isAddCommunityChannelLoading}>
              Join Community Chat
            </Button>
          </div>
          <div />
        </>
      )}
    </div>
  );
}
