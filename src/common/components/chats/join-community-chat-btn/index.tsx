import React, { useContext, useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { History } from "history";

import { Community, ROLES } from "../../../store/communities/types";
import { ActiveUser } from "../../../store/active-user/types";

import { _t } from "../../../i18n";

import { useMappedStore } from "../../../store/use-mapped-store";
import { Channel, communityModerator } from "../../../../managers/message-manager-types";
import * as ls from "../../../util/local-storage";
import { setNostrkeys } from "../../../../managers/message-manager";
import { ChatContext } from "../chat-context-provider";
import { profileUpdater } from "../chat-popup";
import { NOSTRKEY } from "../chat-popup/chat-constants";
import { NostrKeysType } from "../types";
import {
  createNoStrAccount,
  getProfileMetaData,
  setChannelMetaData,
  setProfileMetaData
} from "../utils";

interface Props {
  history: History;
  community: Community;
  activeUser: ActiveUser | null;
  resetChat: () => void;
}

export default function JoinCommunityChatBtn(props: Props) {
  const { messageServiceInstance, setShowSpinner } = useContext(ChatContext);
  const { chat } = useMappedStore();
  const [inProgress, setInProgress] = useState(false);
  const [isCommunityChatJoined, setIsCommunityChatJoined] = useState(false);
  const [isChatEnabled, setIsChatEnabled] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<Channel>();
  const [hasUserJoinedChat, setHasUserJoinedChat] = useState(false);
  const [communityRoles, setCommunityRoles] = useState<communityModerator[]>([]);
  const [activeUserKeys, setActiveUserKeys] = useState<NostrKeysType>();
  const [loadCommunity, setLoadCommunity] = useState(false);
  const [initiateCommunityChat, setInitiateCommunityChat] = useState(false);
  const [shouldUpdateProfile, setShouldUpdateProfile] = useState(false);

  useEffect(() => {
    fetchCommunityProfile();
    fetchUserProfileData();
  }, [chat.channels, currentChannel, chat.leftChannelsList]);

  useEffect(() => {
    fetchCommunityProfile();
  }, [props.activeUser]);

  useEffect(() => {
    if (activeUserKeys) {
      getCommunityRoles();
    }
  }, [activeUserKeys]);

  useEffect(() => {
    if (shouldUpdateProfile && messageServiceInstance) {
      profileUpdater(messageServiceInstance);
    }
  }, [shouldUpdateProfile, messageServiceInstance]);

  useEffect(() => {
    if (messageServiceInstance && shouldUpdateProfile) {
      setShouldUpdateProfile(false);
    }
  }, [messageServiceInstance]);

  useEffect(() => {
    if (messageServiceInstance) {
      fetchUserProfileData();
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

  const fetchUserProfileData = async () => {
    const profileData = await getProfileMetaData(props.activeUser?.username!);
    const hasNoStrKey = profileData && profileData.hasOwnProperty(NOSTRKEY);
    if (hasNoStrKey) {
      setActiveUserKeys(profileData.nsKey);
    }
    setHasUserJoinedChat(hasNoStrKey);
  };

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
    const { community, activeUser } = props;
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
    console.log("Join community chat", messageServiceInstance);
    if (!hasUserJoinedChat) {
      setShowSpinner(true);
      handleJoinChat();
      setLoadCommunity(true);
      setIsCommunityChatJoined(true);
      return;
    }
    if (chat.leftChannelsList.includes(currentChannel?.id!)) {
      messageServiceInstance?.updateLeftChannelList(
        chat.leftChannelsList.filter((x) => x !== currentChannel?.id)
      );
    }
    setIsCommunityChatJoined(true);
    messageServiceInstance?.loadChannel(currentChannel?.id!);
    setIsCommunityChatJoined(true);
  };

  const startCommunityChat = () => {
    if (!hasUserJoinedChat) {
      handleJoinChat();
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

  const handleJoinChat = async () => {
    const { resetChat, activeUser } = props;
    setInProgress(true);
    const keys = createNoStrAccount();
    setActiveUserKeys(keys);
    ls.set(`${activeUser?.username}_nsPrivKey`, keys.priv);
    await setProfileMetaData(props.activeUser, keys.pub);
    setHasUserJoinedChat(true);
    setNostrkeys(keys);
    messageServiceInstance?.updateProfile({
      name: props.activeUser?.username!,
      about: "",
      picture: ""
    });
    setInProgress(false);
    fetchCommunityProfile();
    resetChat();
    setShouldUpdateProfile(true);
  };

  const chatButtonSpinner = (
    <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
  );

  return (
    <>
      {props.community.name === props.activeUser?.username ? (
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