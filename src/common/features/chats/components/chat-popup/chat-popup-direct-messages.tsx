import React, { useContext, useMemo } from "react";
import { _t } from "../../../../i18n";
import { getJoinedCommunities } from "../../utils";
import ImportChats from "../import-chats";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { ChatContext } from "../../chat-context-provider";
import { ChatDirectMessage } from "./chat-direct-message";
import { useChannelsQuery, useDirectContactsQuery, useLastMessagesQuery } from "../../queries";
import { useLeftCommunityChannelsQuery } from "../../queries/left-community-channels-query";

interface Props {
  communityClicked: (v: string) => void;
  userClicked: (v: string) => void;
  setReceiverPubKey: (v: string) => void;
  setShowSearchUser: (v: boolean) => void;
}

export function ChatPopupDirectMessages({
  communityClicked,
  userClicked,
  setReceiverPubKey,
  setShowSearchUser
}: Props) {
  const { activeUserKeys, showSpinner } = useContext(ChatContext);

  const { data: directContacts } = useDirectContactsQuery();
  const { data: directContactsLastMessages } = useLastMessagesQuery();
  const { data: channels } = useChannelsQuery();
  const { data: leftChannelsIds } = useLeftCommunityChannelsQuery();

  const communities = useMemo(
    () => getJoinedCommunities(channels ?? [], leftChannelsIds ?? []),
    [channels, leftChannelsIds]
  );

  return (
    <>
      {(directContacts?.length !== 0 || (channels?.length !== 0 && communities.length !== 0)) &&
      !showSpinner &&
      activeUserKeys?.priv ? (
        <>
          {channels?.length !== 0 && communities.length !== 0 && (
            <>
              <div className="community-header">{_t("chat.communities")}</div>
              {communities.map((channel) => (
                <ChatDirectMessage
                  key={channel.id}
                  username={channel.communityName!!}
                  lastMessage={directContactsLastMessages[channel.name]?.content}
                  userClicked={() => communityClicked(channel.communityName!)}
                />
              ))}
              {directContacts?.length !== 0 && <div className="dm-header">{_t("chat.dms")}</div>}
            </>
          )}
          {directContacts?.map((user) => (
            <ChatDirectMessage
              username={user.name}
              userClicked={(v) => {
                setReceiverPubKey(user.pubkey);
                userClicked(v);
              }}
              key={user.pubkey}
              lastMessage={directContactsLastMessages[user.name]?.content}
            />
          ))}
        </>
      ) : !activeUserKeys?.priv ? (
        <ImportChats />
      ) : showSpinner ? (
        <div className="no-chat">
          <Spinner />
          <p className="mt-3 ml-2">Loading...</p>
        </div>
      ) : (
        <>
          <p className="no-chat">{_t("chat.no-chat")}</p>
          <div className="start-chat-btn">
            <Button onClick={() => setShowSearchUser(true)}>{_t("chat.start-chat")}</Button>
          </div>
        </>
      )}
    </>
  );
}
