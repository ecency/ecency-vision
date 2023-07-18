import React, { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { History } from "history";

import { Community } from "../../store/communities/types";
import { ActiveUser } from "../../store/active-user/types";

import { _t } from "../../i18n";

import { useMappedStore } from "../../store/use-mapped-store";
import { Channel } from "../../../providers/message-provider-types";
import {
  createNoStrAccount,
  getProfileMetaData,
  setChannelMetaData,
  setProfileMetaData
} from "../../helper/chat-utils";
import { setNostrkeys } from "../../../providers/message-provider";

interface Props {
  history: History;
  community: Community;
  activeUser: ActiveUser | null;
  addCommunity: (data: Community) => void;
  resetChat: () => void;
}

export default function JoinCommunityChatBtn(props: Props) {
  const { chat } = useMappedStore();
  const [inProgress, setInProgress] = useState(false);
  const [isJoinChat, setIsJoinChat] = useState(false);
  const [isChatEnabled, setIsChatEnabled] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<Channel>();
  const [hasUserJoinedChat, setHasUserJoinedChat] = useState(false);

  useEffect(() => {
    fetchCommunityProfile();
    fetchUserProfileData();
  }, [chat.channels, currentChannel, chat.leftChannelsList]);

  useEffect(() => {
    fetchCommunityProfile();
  }, [props.activeUser]);

  useEffect(() => {
    if (window.raven) {
      setHasUserJoinedChat(true);
    }
  }, [window?.raven]);

  useEffect(() => {
    checkIsChatJoined();

    fetchCurrentChannel();
  }, [isJoinChat, props.community, chat.channels, chat.leftChannelsList]);

  const fetchUserProfileData = async () => {
    const profileData = await getProfileMetaData(props.activeUser?.username!);
    const hasNoStrKey = profileData.hasOwnProperty("noStrKey");
    setHasUserJoinedChat(hasNoStrKey);
  };

  const fetchCommunityProfile = async () => {
    const communityProfile = await getProfileMetaData(props.community?.name);
    const haschannelMetaData = communityProfile.hasOwnProperty("channel");
    setIsChatEnabled(haschannelMetaData);
    const hasNoStrKey = communityProfile.hasOwnProperty("noStrKey");
    if (!currentChannel) {
      setCurrentChannel(communityProfile.channel);
    }

    if (!haschannelMetaData && currentChannel) {
      await setChannelMetaData(props.community.name, currentChannel!);
    }
  };

  const checkIsChatJoined = () => {
    for (const item of chat.channels) {
      if (
        item.communityName === props.community.name &&
        !chat.leftChannelsList.includes(currentChannel?.id!)
      ) {
        setIsJoinChat(true);
      } else {
        setIsJoinChat(false);
      }
    }
  };

  const createCommunityChat = async () => {
    const { community } = props;
    try {
      setInProgress(true);
      const data = await window?.raven?.createChannel({
        name: community.title,
        about: community.description,
        communityName: community.name,
        picture: ""
      });

      const content = JSON.parse(data?.content!);
      const channelMetaData = {
        id: data?.id as string,
        creator: data?.pubkey as string,
        created: data?.created_at!,
        communityName: content.communityName,
        name: content.name,
        about: content.about,
        picture: content.picture
      };
      await setChannelMetaData(community.name, currentChannel!);
      setCurrentChannel(channelMetaData);
    } finally {
      setInProgress(false);
      setIsJoinChat(true);
    }
  };

  const joinCommunityChat = () => {
    if (chat.leftChannelsList.includes(currentChannel?.id!)) {
      window?.raven?.updateLeftChannelList(
        chat.leftChannelsList.filter((x) => x !== currentChannel?.id)
      );
    }
    window?.raven?.loadChannel(currentChannel?.id!);
    setIsJoinChat(true);
  };

  const fetchCurrentChannel = () => {
    for (const item of chat.channels) {
      if (item.communityName === props.community.name) {
        setCurrentChannel(item);
        return item;
      }
    }
    return {};
  };

  const handleJoinChat = async () => {
    const { resetChat } = props;
    setInProgress(true);
    const keys = createNoStrAccount();
    await setProfileMetaData(props.activeUser, keys);
    setHasUserJoinedChat(true);
    setNostrkeys(keys);
    window.raven?.updateProfile({ name: props.activeUser?.username!, about: "", picture: "" });
    setInProgress(false);
    fetchCommunityProfile();
    resetChat();
  };

  const chatButtonSpinner = (
    <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
  );

  return (
    <>
      {props.community["context"].role === "owner" ? (
        isJoinChat ? (
          <Button variant="outline-primary">Chat Joined</Button>
        ) : hasUserJoinedChat && !isChatEnabled ? (
          <Button onClick={createCommunityChat}>
            {inProgress && chatButtonSpinner}
            Start Community Chat
          </Button>
        ) : !isJoinChat && isChatEnabled ? (
          <Button onClick={joinCommunityChat}>
            {" "}
            {inProgress && chatButtonSpinner}Join Community Chat
          </Button>
        ) : (
          <Button onClick={handleJoinChat}> {inProgress && chatButtonSpinner}Join Chat</Button>
        )
      ) : isChatEnabled && !isJoinChat && hasUserJoinedChat ? (
        <Button onClick={joinCommunityChat}>{_t("community.join-community-chat")}</Button>
      ) : !hasUserJoinedChat ? (
        <Button onClick={handleJoinChat}> {inProgress && chatButtonSpinner}Join Chat </Button>
      ) : isJoinChat ? (
        <Button variant="outline-primary">Chat Joined</Button>
      ) : (
        <></>
      )}
    </>
  );
}
