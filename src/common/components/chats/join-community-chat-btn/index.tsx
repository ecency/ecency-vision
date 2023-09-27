import React, { useContext, useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { History } from "history";

import { Community, ROLES } from "../../../store/communities/types";

import { _t } from "../../../i18n";

import { useMappedStore } from "../../../store/use-mapped-store";
import { Channel, communityModerator } from "../../../../managers/message-manager-types";
import { ChatContext } from "../chat-context-provider";
import { CHANNEL, NOSTRKEY } from "../chat-popup/chat-constants";
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
  const [currentCommunity, setCurrentCommunity] = useState<Channel>();
  const [communityRoles, setCommunityRoles] = useState<communityModerator[]>([]);
  const [loadCommunity, setLoadCommunity] = useState(false);
  const [initiateCommunityChat, setInitiateCommunityChat] = useState(false);

  useEffect(() => {
    fetchCommunityProfile();
  }, [chat.channels, currentCommunity, chat.leftChannelsList]);

  useEffect(() => {
    fetchCommunityProfile();
  }, [activeUser]);

  useEffect(() => {
    if (activeUserKeys && activeUser?.username === props.community.name) {
      getCommunityRoles();
    }
  }, [activeUserKeys]);

  useEffect(() => {
    fetchCommunityProfile();
    checkIsChatJoined();
    if (messageServiceInstance) {
      if (loadCommunity) {
        messageServiceInstance?.loadChannel(currentCommunity?.id!);
        setInProgress(false);
      }
      if (
        initiateCommunityChat &&
        communityRoles.some((role) => role.pubkey === activeUserKeys.pub)
      ) {
        createCommunityChat();
      }
    }
  }, [messageServiceInstance, loadCommunity, communityRoles, initiateCommunityChat]);

  useEffect(() => {
    checkIsChatJoined();

    fetchCurrentChannel();
  }, [isCommunityChatJoined, props.community, chat.channels, chat.leftChannelsList]);

  const fetchCommunityProfile = async () => {
    const communityProfile = await getProfileMetaData(props.community?.name);
    const haschannelMetaData = communityProfile && communityProfile.hasOwnProperty(CHANNEL);
    setIsChatEnabled(haschannelMetaData);

    if (!currentCommunity) {
      setCurrentCommunity(communityProfile.channel);
    }
  };

  const checkIsChatJoined = () => {
    setIsCommunityChatJoined(
      chat.channels.some(
        (item) =>
          item.communityName === props.community.name &&
          !chat.leftChannelsList.includes(currentCommunity?.id!)
      )
    );
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
        setCurrentCommunity(channelMetaData)
      );
    } finally {
      setInProgress(false);
      setIsCommunityChatJoined(true);
      setInitiateCommunityChat(false);
    }
  };

  const joinCommunityChat = () => {
    setInProgress(true);
    if (!hasUserJoinedChat) {
      joinChat();
      setLoadCommunity(true);
      return;
    }
    if (chat.leftChannelsList.includes(currentCommunity?.id!)) {
      messageServiceInstance?.updateLeftChannelList(
        chat.leftChannelsList.filter((x) => x !== currentCommunity?.id)
      );
    }
    messageServiceInstance?.loadChannel(currentCommunity?.id!);
    setIsCommunityChatJoined(true);
    setInProgress(false);
  };

  const startCommunityChat = () => {
    setInProgress(true);
    if (!hasUserJoinedChat) {
      joinChat();
      setInitiateCommunityChat(true);

      return;
    } else {
      createCommunityChat();
    }
  };

  const fetchCurrentChannel = () => {
    for (const item of chat.channels) {
      if (item.communityName === props.community.name) {
        setCurrentCommunity(item);
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
