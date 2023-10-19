import React, { useContext, useEffect, useState } from "react";
import { _t } from "../../../../i18n";
import { getCommunityLastMessage, getDirectLastMessage, getJoinedCommunities } from "../../utils";
import ImportChats from "../import-chats";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { ChatContext } from "../../chat-context-provider";
import { Channel } from "../../../../../managers/message-manager-types";
import { ChatDirectMessage } from "./chat-direct-message";

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
  const { chat } = useMappedStore();
  const { activeUserKeys, showSpinner } = useContext(ChatContext);

  const [communities, setCommunities] = useState<Channel[]>([]);

  useEffect(() => {
    const communities = getJoinedCommunities(chat.channels, chat.leftChannelsList);
    setCommunities(communities);
  }, [chat.channels, chat.leftChannelsList]);

  return (
    <>
      {(chat.directContacts.length !== 0 ||
        (chat.channels.length !== 0 && communities.length !== 0)) &&
      !showSpinner &&
      activeUserKeys?.priv ? (
        <>
          {chat.channels.length !== 0 && communities.length !== 0 && (
            <>
              <div className="community-header">{_t("chat.communities")}</div>
              {communities.map((channel) => (
                <ChatDirectMessage
                  key={channel.id}
                  username={channel.communityName!!}
                  lastMessage={getCommunityLastMessage(channel.id, chat.publicMessages)}
                  userClicked={() => communityClicked(channel.communityName!)}
                />
              ))}
              {chat.directContacts.length !== 0 && (
                <div className="dm-header">{_t("chat.dms")}</div>
              )}
            </>
          )}
          {chat.directContacts.map((user) => (
            <ChatDirectMessage
              username={user.name}
              userClicked={(v) => {
                setReceiverPubKey(user.pubkey);
                userClicked(v);
              }}
              key={user.pubkey}
              lastMessage={getDirectLastMessage(user.pubkey, chat.directMessages)}
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
