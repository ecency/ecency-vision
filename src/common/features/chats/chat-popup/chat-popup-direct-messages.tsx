import React, { useContext, useEffect, useState } from "react";
import { _t } from "../../../i18n";
import { Link } from "react-router-dom";
import { getCommunityLastMessage, getDirectLastMessage, getJoinedCommunities } from "../utils";
import ImportChats from "../import-chats";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { useMappedStore } from "../../../store/use-mapped-store";
import { ChatContext } from "../chat-context-provider";
import { Channel } from "../../../../managers/message-manager-types";
import UserAvatar from "../../../components/user-avatar";

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
        <React.Fragment>
          {chat.channels.length !== 0 && communities.length !== 0 && (
            <>
              <div className="community-header">{_t("chat.communities")}</div>
              {communities.map((channel) => (
                <div key={channel.id} className="chat-content">
                  <Link to={`/created/${channel.communityName}`}>
                    <div className="user-img">
                      <span>
                        <UserAvatar username={channel.communityName!} size="medium" />
                      </span>
                    </div>
                  </Link>

                  <div
                    className="user-title"
                    onClick={() => communityClicked(channel.communityName!)}
                  >
                    <p className="username">{channel.name}</p>
                    <p className="last-message">
                      {getCommunityLastMessage(channel.id, chat.publicMessages)}
                    </p>
                  </div>
                </div>
              ))}
              {chat.directContacts.length !== 0 && (
                <div className="dm-header">{_t("chat.dms")}</div>
              )}
            </>
          )}
          {chat.directContacts.map((user) => (
            <div key={user.pubkey} className="chat-content">
              <Link to={`/@${user.name}`}>
                <div className="user-img">
                  <span>
                    <UserAvatar username={user.name} size="medium" />
                  </span>
                </div>
              </Link>

              <div
                className="user-title"
                onClick={() => {
                  userClicked(user.name);
                  setReceiverPubKey(user.pubkey);
                }}
              >
                <p className="username">{user.name}</p>
                <p className="last-message">
                  {getDirectLastMessage(user.pubkey, chat.directMessages)}
                </p>
              </div>
            </div>
          ))}
        </React.Fragment>
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
