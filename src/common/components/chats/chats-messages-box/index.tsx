import React, { useEffect, useState } from "react";
import { match } from "react-router";
import { History } from "history";
import { Account } from "../../../store/accounts/types";
import { ToggleType, UI } from "../../../store/ui/types";
import { User } from "../../../store/users/types";
import ChatsMessagesHeader from "../chats-messages-header";
import ChatsMessagesView from "../chats-messages-view";

import { Channel, ChannelUpdate } from "../../../../managers/message-manager-types";
import LinearProgress from "../../linear-progress";
import { formattedUserName, getProfileMetaData } from "../utils";
import { useMappedStore } from "../../../store/use-mapped-store";

import "./index.scss";
import { CHANNEL } from "../chat-popup/chat-constants";

interface MatchParams {
  filter: string;
  name: string;
  path: string;
  url: string;
  username: string;
}

interface Props {
  match: match<MatchParams>;
  users: User[];
  history: History;
  ui: UI;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
}

export default function ChatsMessagesBox(props: Props) {
  const { chat } = useMappedStore();

  const { channels, updatedChannel } = chat;
  const { match } = props;
  const username = match.params.username;

  const [maxHeight, setMaxHeight] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<Channel>();
  const [inProgress, setInProgress] = useState(false);
  const [isCommunityChatEnabled, setIsCommunityChatEnabled] = useState(false);

  useEffect(() => {
    setMaxHeight(window.innerHeight - 68);
  }, [typeof window !== "undefined"]);

  useEffect(() => {
    if (username && !username.startsWith("@")) {
      const isCommunity = chat.channels.some((channel) => channel.communityName === username);
      if (!isCommunity) {
        getCommunityProfile();
      } else {
        setIsCommunityChatEnabled(true);
      }
    }
  }, [username]);

  useEffect(() => {
    console.log("Observe here currentChannel", currentChannel);
  }, [currentChannel]);

  useEffect(() => {
    fetchCurrentChannel(formattedUserName(username));
  }, [updatedChannel, username, channels]);

  const fetchCurrentChannel = (communityName: string) => {
    const channel = channels.find((channel) => channel.communityName === communityName);
    if (channel) {
      const updated: ChannelUpdate = updatedChannel
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

  const getCommunityProfile = async () => {
    const communityProfile = await getProfileMetaData(username);
    const haschannelMetaData = communityProfile && communityProfile.hasOwnProperty(CHANNEL);
    setIsCommunityChatEnabled(haschannelMetaData);
  };

  return (
    <>
      <div className="chats-messages-box" style={{ maxHeight: maxHeight }}>
        {match.url == "/chats" ? (
          <div className="no-chat-select d-flex justify-content-center align-items-center">
            <p className="start-chat text-center">Select a chat or start a new conversation</p>
          </div>
        ) : isCommunityChatEnabled ? (
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
            />
          </>
        ) : (
          <p className="no-chat-select d-flex justify-content-center align-items-center">
            Community chat not started yet
          </p>
        )}
      </div>
    </>
  );
}
