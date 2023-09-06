import React, { useEffect, useState } from "react";
import { History } from "history";
import { _t } from "../../../i18n";
import { useMappedStore } from "../../../store/use-mapped-store";
import ChatsCommunityDropdownMenu from "../chats-community-dropdown-menu";
import UserAvatar from "../../user-avatar";

import "./index.scss";
import { Channel } from "../../../../providers/message-provider-types";
import { CHATPAGE } from "../chat-popup/chat-constants";
import { Chat } from "../../../store/chat/types";
import { formattedUserName } from "../utils";

interface Props {
  username: string;
  history: History | null;
  currentChannel: Channel;
  currentChannelSetter: (channe: Channel) => void;
}

export default function ChatsMessagesHeader(props: Props) {
  const { username, currentChannel, currentChannelSetter } = props;
  const { chat } = useMappedStore();

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
        <div className="user-info">
          <UserAvatar username={formattedUserName(username)} size="medium" />
          <p className="username">{formattedName(username, chat)}</p>
        </div>
        {isChannel(username) && (
          <div className="community-menu">
            <ChatsCommunityDropdownMenu
              from={CHATPAGE}
              {...props}
              currentChannel={currentChannel!}
              currentChannelSetter={currentChannelSetter}
            />
          </div>
        )}
      </div>
    </div>
  );
}
