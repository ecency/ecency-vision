import React, { useContext, useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { History } from "history";

import { Community, ROLES } from "../../../store/communities/types";

import { _t } from "../../../i18n";

import { useMappedStore } from "../../../store/use-mapped-store";
import { Channel, communityModerator } from "../../../../managers/message-manager-types";
import { ChatContext } from "../chat-context-provider";
import { NOSTRKEY } from "../chat-popup/chat-constants";
import { getProfileMetaData, setChannelMetaData } from "../utils";

interface Props {
  history: History;
  community: Community;
}

export default function JoinCommunityChatBtn(props: Props) {
  const { messageServiceInstance, activeUserKeys, hasUserJoinedChat, joinChat } =
    useContext(ChatContext);
  const { chat, activeUser } = useMappedStore();
  const [inProgress, setInProgress] = useState(false);
  const [isCommunityChatJoined, setIsCommunityChatJoined] = useState(false);
  const [isChatEnabled, setIsChatEnabled] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<Channel>();
  const [communityRoles, setCommunityRoles] = useState<communityModerator[]>([]);
  const [loadCommunity, setLoadCommunity] = useState(false);
  const [initiateCommunityChat, setInitiateCommunityChat] = useState(false);

  useEffect(() => {
    fetchCommunityProfile();
  }, [chat.channels, currentChannel, chat.leftChannelsList]);

  useEffect(() => {
    fetchCommunityProfile();
  }, [activeUser]);

  useEffect(() => {
    if (activeUserKeys && activeUser?.username === props.community.name) {
      getCommunityRoles();
    }
  }, [activeUserKeys]);

  useEffect(() => {
    if (messageServiceInstance) {
      if (loadCommunity) {
        messageServiceInstance?.loadChannel(currentChannel?.id!);
      }
      if (initiateCommunityChat && communityRoles.length !== 0) {
        createCommunityChat();
      }
    }
  }, [
    typeof window !== "undefined" && messageServiceInstance,
    loadCommunity,
    communityRoles,
    initiateCommunityChat
  ]);

  useEffect(() => {
    checkIsChatJoined();

    fetchCurrentChannel();
  }, [isCommunityChatJoined, props.community, chat.channels, chat.leftChannelsList]);

  const fetchCommunityProfile = async () => {
    const communityProfile = await getProfileMetaData(props.community?.name);
    const haschannelMetaData = communityProfile && communityProfile.hasOwnProperty("channel");
    setIsChatEnabled(haschannelMetaData);

    if (!currentChannel) {
      setCurrentChannel(communityProfile.channel);
    }
  };

  const checkIsChatJoined = () => {
    for (const item of chat.channels) {
      if (
        item.communityName === props.community.name &&
        !chat.leftChannelsList.includes(currentChannel?.id!)
      ) {
        setIsCommunityChatJoined(true);
      } else {
        setIsCommunityChatJoined(false);
      }
    }
  };

  const getCommunityRoles = async () => {
    let communityTeam: communityModerator[] = [];
    const { community } = props;
    const ownerData = await getProfileMetaData(community.name);
    const ownerRole = {
      name: activeUser!.username,
      pubkey: activeUserKeys?.pub || ownerData.nsKey,
      role: "owner"
    };

    communityTeam.push(ownerRole);

    for (let i = 0; i < community.team.length; i++) {
      const item = community.team[i];
      if (item[1] === ROLES.ADMIN || item[1] === ROLES.MOD) {
        const profileData = await getProfileMetaData(item[0]);
        if (profileData && profileData.hasOwnProperty(NOSTRKEY)) {
          const roleInfo: communityModerator = {
            name: item[0],
            pubkey: profileData.nsKey,
            role: item[1]
          };

          communityTeam.push(roleInfo);
        }
      }
    }
    setCommunityRoles(communityTeam);
  };

  const createCommunityChat = async () => {
    const { community } = props;
    try {
      setInProgress(true);
      const data = await messageServiceInstance?.createChannel({
        name: community.title,
        about: community.description,
        communityName: community.name,
        picture: "",
        communityModerators: communityRoles,
        hiddenMessageIds: [],
        removedUserIds: []
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
      setChannelMetaData(community.name, channelMetaData).then(() =>
        setCurrentChannel(channelMetaData)
      );
    } finally {
      setInProgress(false);
      setIsCommunityChatJoined(true);
      setInitiateCommunityChat(false);
    }
  };

  const joinCommunityChat = () => {
    if (!hasUserJoinedChat) {
      setInProgress(true);
      joinChat();
      setLoadCommunity(true);
      setIsCommunityChatJoined(true);
      return;
    }
    if (chat.leftChannelsList.includes(currentChannel?.id!)) {
      messageServiceInstance?.updateLeftChannelList(
        chat.leftChannelsList.filter((x) => x !== currentChannel?.id)
      );
    }
    messageServiceInstance?.loadChannel(currentChannel?.id!);
    setIsCommunityChatJoined(true);
  };

  const startCommunityChat = () => {
    if (!hasUserJoinedChat) {
      joinChat();
      setInitiateCommunityChat(true);
      setIsCommunityChatJoined(true);
      return;
    } else {
      createCommunityChat();
    }
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

  const chatButtonSpinner = (
    <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
  );

  return (
    <>
      {props.community.name === activeUser?.username ? (
        isCommunityChatJoined ? (
          <Button variant="outline-primary">{_t("chat.chat-joined")}</Button>
        ) : !isChatEnabled ? (
          <Button onClick={startCommunityChat}>
            {inProgress && chatButtonSpinner}
            {_t("chat.start-community-chat")}
          </Button>
        ) : !isCommunityChatJoined && isChatEnabled && hasUserJoinedChat ? (
          <Button onClick={joinCommunityChat}>
            {" "}
            {inProgress && chatButtonSpinner}
            {_t("chat.join-community-chat")}
          </Button>
        ) : (
          <></>
        )
      ) : isChatEnabled && !isCommunityChatJoined ? (
        <Button onClick={joinCommunityChat}>
          {inProgress && chatButtonSpinner}
          {_t("community.join-community-chat")}
        </Button>
      ) : isCommunityChatJoined ? (
        <Button variant="outline-primary">{_t("chat.chat-joined")}</Button>
      ) : (
        <></>
      )}
    </>
  );
}
