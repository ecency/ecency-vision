import React, { useEffect, useState } from "react";
import { match } from "react-router";
import { History } from "history";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import { Chat } from "../../store/chat/types";
import { ToggleType, UI } from "../../store/ui/types";
import { User } from "../../store/users/types";
import ChatsMessagesHeader from "../chats-messages-header";
import ChatsMessagesView from "../chats-messages-view";
import { Global, Theme } from "../../store/global/types";

import "./index.scss";
import { formattedUserName, NostrKeysType } from "../../helper/chat-utils";
import { Channel, ChannelUpdate } from "../../../providers/message-provider-types";
import LinearProgress from "../linear-progress";

interface MatchParams {
  filter: string;
  name: string;
  path: string;
  url: string;
  username: string;
}

interface Props {
  match: match<MatchParams>;
  chat: Chat;
  global: Global;
  users: User[];
  history: History | null;
  activeUser: ActiveUser | null;
  ui: UI;
  activeUserKeys: NostrKeysType;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  deletePublicMessage: (channelId: string, msgId: string) => void;
}

export default function ChatsMessagesBox(props: Props) {
  const { match, global, deletePublicMessage } = props;
  const username = match.params.username;

  const [maxHeight, setMaxHeight] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<Channel>();
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    setMaxHeight(window.innerHeight - 68);
  }, [typeof window !== "undefined"]);

  useEffect(() => {
    console.log("state has been updated", currentChannel);
  }, [currentChannel]);

  useEffect(() => {
    fetchCurrentChannel(formattedUserName(username));
  }, [props.chat.updatedChannel, username, props.chat.channels]);

  const fetchCurrentChannel = (communityName: string) => {
    const channel = props.chat.channels.find((channel) => channel.communityName === communityName);
    if (channel) {
      const updated: ChannelUpdate = props.chat.updatedChannel
        .filter((x) => x.channelId === channel.id)
        .sort((a, b) => b.created - a.created)[0];
      if (updated) {
        const channel = {
          name: updated.name,
          about: updated.about,
          picture: updated.picture,
          communityName: updated.communityName,
          communityModerators: updated.communityModerators,
          id: updated.channelId,
          creator: updated.creator,
          created: currentChannel?.created!,
          hiddenMessageIds: updated.hiddenMessageIds,
          removedUserIds: updated.removedUserIds
        };
        setCurrentChannel(channel);
      } else {
        setCurrentChannel(channel);
      }
    }
  };

  return (
    <>
      <div className="chats-messages-box" style={{ maxHeight: maxHeight }}>
        {match.url == "/chats" ? (
          <div className="no-chat-select d-flex justify-content-center align-items-center">
            <p className="start-chat text-center">Select a chat or start a new conversation</p>
          </div>
        ) : (
          <>
            <ChatsMessagesHeader
              username={username}
              {...props}
              currentChannel={currentChannel!}
              currentChannelSetter={setCurrentChannel}
            />
            {inProgress && <LinearProgress />}
            <ChatsMessagesView
              {...props}
              username={username}
              currentChannel={currentChannel!}
              inProgress={inProgress}
              currentChannelSetter={setCurrentChannel}
              setInProgress={setInProgress}
              deletePublicMessage={deletePublicMessage}
            />
          </>
        )}
      </div>
    </>
  );
}
