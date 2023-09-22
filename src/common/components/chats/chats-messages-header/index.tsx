import React, { useContext, useEffect, useState } from "react";
import { History } from "history";
import { _t } from "../../../i18n";
import { useMappedStore } from "../../../store/use-mapped-store";
import ChatsCommunityDropdownMenu from "../chats-community-dropdown-menu";
import UserAvatar from "../../user-avatar";

import "./index.scss";
import { Channel } from "../../../../managers/message-manager-types";
import { CHATPAGE } from "../chat-popup/chat-constants";
import { Chat } from "../../../store/chat/types";
import { formattedUserName } from "../utils";
import Link from "../../alink";
import { expandSideBar } from "../../../img/svg";
import { ChatContext } from "../chat-context-provider";

interface Props {
  username: string;
  history: History;
}

export default function ChatsMessagesHeader(props: Props) {
  const { username } = props;
  const { chat } = useMappedStore();
  const { setShowSideBar } = useContext(ChatContext);

  const isChannel = (username: string) => {
    if (username.startsWith("@")) {
      return false;
    }
    return true;
  };

  const formattedName = (username: string, chat: Chat) => {
    if (username && !username.startsWith("@")) {
      const community = chat.channels.find((channel) => channel.communityName === username);
      if (community) {
        return community.name;
      }
    }
    const replacedUserName = username.replace("@", "");
    return replacedUserName;
  };

  return (
    <div className="chats-messages-header">
      <div className="d-flex justify-content-between header-content">
        <div className="d-flex user-info-wrapper">
          <div className="expand-icon d-md-none">
            <p className="expand-svg" onClick={() => setShowSideBar(true)}>
              {expandSideBar}
            </p>
          </div>
          <Link
            to={username.startsWith("@") ? `/${username}` : `/created/${username}`}
            target="_blank"
            style={{ textDecoration: "none" }}
          >
            <div className="user-info">
              <UserAvatar username={formattedUserName(username)} size="medium" />
              <p className="username">{formattedName(username, chat)}</p>
            </div>
          </Link>
        </div>

        {isChannel(username) && (
          <div className="community-menu">
            <ChatsCommunityDropdownMenu from={CHATPAGE} {...props} />
          </div>
        )}
      </div>
    </div>
  );
}
