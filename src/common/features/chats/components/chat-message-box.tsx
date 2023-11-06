import React, { useContext, useEffect, useState } from "react";
import { match } from "react-router";
import { History } from "history";
import ChatsMessagesHeader from "./chat-messages-header";
import ChatsMessagesView from "./chat-messages-view";
import LinearProgress from "../../../components/linear-progress";
import { formattedUserName, getJoinedCommunities, getProfileMetaData } from "../utils";
import { useMappedStore } from "../../../store/use-mapped-store";
import { CHANNEL } from "./chat-popup/chat-constants";
import { ChatContext } from "../chat-context-provider";
import { useMount } from "react-use";
import { Button } from "@ui/button";
import { Channel, ChannelUpdate } from "../managers/message-manager-types";
import { useChannelsQuery } from "../queries";

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
}

export default function ChatsMessagesBox(props: Props) {
  const { chat } = useMappedStore();
  const { data: channels } = useChannelsQuery();

  const { messageServiceInstance, currentChannel, setCurrentChannel } = useContext(ChatContext);

  const { updatedChannel } = chat;
  const { match } = props;
  const username = match.params.username;

  const [inProgress, setInProgress] = useState(false);
  const [isCommunityChatEnabled, setIsCommunityChatEnabled] = useState(false);
  const [isCommunityJoined, setIsCommunityChatJoined] = useState(false);
  const [currentCommunity, setCurrentCommunity] = useState<Channel>();
  const [hasLeftCommunity, setHasLeftCommunity] = useState(false);

  useMount(() => {
    checkUserCommunityMembership();
  });

  useEffect(() => {
    if (currentCommunity && chat.leftChannelsList.includes(currentCommunity.id)) {
      setHasLeftCommunity(true);
    }
  }, [currentCommunity]);

  useEffect(() => {
    if (username && !username.startsWith("@")) {
      checkUserCommunityMembership();
    } else {
      setIsCommunityChatJoined(false);
      setIsCommunityChatEnabled(true);
    }
  }, [username]);

  const checkUserCommunityMembership = () => {
    getCommunityProfile();
    const communities = getJoinedCommunities(channels ?? [], chat.leftChannelsList);
    const isCommunity = channels?.some((channel) => channel.communityName === username);
    if (isCommunity) {
      setIsCommunityChatEnabled(true);
      const isJoined = communities.some((channel) => channel.communityName === username);
      if (isJoined) {
        setIsCommunityChatJoined(true);
      }
    } else {
      setIsCommunityChatJoined(false);
    }
  };

  useEffect(() => {
    fetchCurrentChannel(formattedUserName(username));
    checkUserCommunityMembership();
  }, [updatedChannel, username, channels]);

  // TODO: MAKE QUERY
  const fetchCurrentChannel = (communityName: string) => {
    const channel = channels?.find((channel) => channel.communityName === communityName);
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
    setCurrentCommunity(communityProfile?.channel);
    const haschannelMetaData = communityProfile && communityProfile.hasOwnProperty(CHANNEL);
    setIsCommunityChatEnabled(haschannelMetaData);
  };

  const handleJoinCommunity = () => {
    if (currentCommunity) {
      if (hasLeftCommunity) {
        messageServiceInstance?.updateLeftChannelList(
          chat.leftChannelsList.filter((x) => x !== currentCommunity?.id)
        );
      }
      messageServiceInstance?.loadChannel(currentCommunity?.id);
      setIsCommunityChatJoined(true);
    }
  };

  return (
    <div
      className="grid min-h-full"
      style={{
        gridTemplateRows: "min-content 1fr min-content"
      }}
    >
      {match.url === "/chats" ? (
        <div className="no-chat-select">
          <div className="start-chat-wrapper text-center ">
            <p className="start-chat ">Select a chat or start a new conversation</p>
          </div>
        </div>
      ) : (
        <>
          {username.startsWith("@") || (isCommunityChatEnabled && isCommunityJoined) ? (
            <>
              <ChatsMessagesHeader username={username} history={props.history} />
              {inProgress && <LinearProgress />}
              <ChatsMessagesView
                history={props.history}
                username={username}
                currentChannel={currentChannel!}
                inProgress={inProgress}
                currentChannelSetter={setCurrentChannel}
                setInProgress={setInProgress}
              />
            </>
          ) : isCommunityChatEnabled && !isCommunityJoined ? (
            <div className="no-chat-select">
              <div className="text-center">
                <p className="info-message">
                  {hasLeftCommunity
                    ? "You have left this community chat. Rejoin the chat now!"
                    : " You are not part of this community. Join the community chat now!"}
                </p>
                <Button onClick={handleJoinCommunity}>
                  {hasLeftCommunity ? "Rejoin Community Chat" : "Join Community Chat"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="no-chat-select">Community chat not started yet</p>
          )}
        </>
      )}
    </div>
  );
}
