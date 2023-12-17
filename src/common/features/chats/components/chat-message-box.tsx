import React, { useMemo, useState } from "react";
import { match } from "react-router";
import { History } from "history";
import ChatsMessagesHeader from "./chat-messages-header";
import ChatsMessagesView from "./chat-messages-view";
import LinearProgress from "../../../components/linear-progress";
import { Button } from "@ui/button";
import { useCommunityCache } from "../../../core";
import ChatsProfileBox from "./chat-profile-box";
import { _t } from "../../../i18n";
import {
  Channel,
  DirectContact,
  getJoinedCommunities,
  useAddCommunityChannel,
  useAutoScrollInChatBox,
  useChannelsQuery,
  useCommunityChannelQuery,
  useDirectContactsQuery,
  useLeftCommunityChannelsQuery
} from "@ecency/ns-query";
import { useGetAccountFullQuery } from "../../../api/queries";

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
  channel?: Channel;
  currentContact?: DirectContact;
}

export default function ChatsMessagesBox(props: Props) {
  const { data: communityAccount } = useGetAccountFullQuery(props.match.params.username);
  const { data: community } = useCommunityCache(props.match.params.username);

  const { data: directContacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();
  const { data: leftChannelsIds } = useLeftCommunityChannelsQuery();
  const { data: communityChannel } = useCommunityChannelQuery(
    community ?? undefined,
    communityAccount
  );
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
  const currentContact = useMemo(
    () => directContacts?.find((dc) => dc.name === props.match.params.username),
    [directContacts, props.match.params]
  );

  useAutoScrollInChatBox(
    communityChannel?.name ?? currentContact?.name ?? "",
    communityChannel?.id ?? currentContact?.pubkey ?? ""
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
            currentContact={props.currentContact!!}
            currentChannel={props.channel!!}
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
            <Button onClick={() => addCommunityChannel([])} disabled={isAddCommunityChannelLoading}>
              {hasLeftCommunity ? "Rejoin Community Chat" : "Join Community Chat"}
            </Button>
          </div>
          <div />
        </>
      )}
    </div>
  );
}
