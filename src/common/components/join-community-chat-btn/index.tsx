import React, { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { History } from "history";

import { Community, ROLES } from "../../store/communities/types";
import { ActiveUser } from "../../store/active-user/types";

import { _t } from "../../i18n";

import { useMappedStore } from "../../store/use-mapped-store";
import { Channel, communityModerator } from "../../../providers/message-provider-types";
import {
  createNoStrAccount,
  getProfileMetaData,
  NostrKeysType,
  setChannelMetaData,
  setProfileMetaData
} from "../../helper/chat-utils";
import * as ls from "../../util/local-storage";
import { setNostrkeys } from "../../../providers/message-provider";
import { NOSTRKEY } from "../chat-box/chat-constants";

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
  const [isCommunityChatJoined, setIsCommunityChatJoined] = useState(false);
  const [isChatEnabled, setIsChatEnabled] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<Channel>();
  const [hasUserJoinedChat, setHasUserJoinedChat] = useState(false);
  const [communityRoles, setCommunityRoles] = useState<communityModerator[]>([]);
  const [activeUserKeys, setActiveUserKeys] = useState<NostrKeysType>();
  const [loadCommunity, setLoadCommunity] = useState(false);

  useEffect(() => {
    getCommunityRoles();
  }, []);

  useEffect(() => {
    fetchCommunityProfile();
    fetchUserProfileData();
  }, [chat.channels, currentChannel, chat.leftChannelsList]);

  useEffect(() => {
    fetchCommunityProfile();
  }, [props.activeUser]);

  useEffect(() => {
    if (window.messageService && activeUserKeys) {
      getCommunityRoles();
      setHasUserJoinedChat(true);
      if (loadCommunity) {
        window?.messageService?.loadChannel(currentChannel?.id!);
      }
    }
  }, [window?.messageService, activeUserKeys, loadCommunity]);

  useEffect(() => {
    checkIsChatJoined();

    fetchCurrentChannel();
  }, [isCommunityChatJoined, props.community, chat.channels, chat.leftChannelsList]);

  const fetchUserProfileData = async () => {
    const profileData = await getProfileMetaData(props.activeUser?.username!);
    const hasNoStrKey = profileData && profileData.hasOwnProperty(NOSTRKEY);
    setHasUserJoinedChat(hasNoStrKey);
  };

  const fetchCommunityProfile = async () => {
    const communityProfile = await getProfileMetaData(props.community?.name);
    const haschannelMetaData = communityProfile && communityProfile.hasOwnProperty("channel");
    setIsChatEnabled(haschannelMetaData);
    const hasNoStrKey = communityProfile && communityProfile.hasOwnProperty(NOSTRKEY);
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
    let communityRoles: communityModerator[] = [];
    const { community, activeUser } = props;
    const ownerData = await getProfileMetaData(community.name);
    const ownerRole = {
      name: activeUser!.username,
      pubkey: activeUserKeys?.pub || ownerData.noStrKey,
      role: "owner"
    };

    communityRoles.push(ownerRole);

    for (let i = 0; i < community.team.length; i++) {
      const item = community.team[i];
      if (item[1] === ROLES.ADMIN || item[1] === ROLES.MOD) {
        const profileData = await getProfileMetaData(item[0]);
        if (profileData && profileData.hasOwnProperty(NOSTRKEY)) {
          const roleInfo: communityModerator = {
            name: item[0],
            pubkey: profileData.noStrKey,
            role: item[1]
          };

          communityRoles.push(roleInfo);
        }
      }
    }
    setCommunityRoles(communityRoles);
  };

  const createCommunityChat = async () => {
    const { community } = props;
    try {
      setInProgress(true);
      const data = await window?.messageService?.createChannel({
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
    }
  };

  const joinCommunityChat = () => {
    if (!hasUserJoinedChat) {
      handleJoinChat();
      setLoadCommunity(true);
      setIsCommunityChatJoined(true);
      return;
    }
    if (chat.leftChannelsList.includes(currentChannel?.id!)) {
      window?.messageService?.updateLeftChannelList(
        chat.leftChannelsList.filter((x) => x !== currentChannel?.id)
      );
    }
    window?.messageService?.loadChannel(currentChannel?.id!);
    setIsCommunityChatJoined(true);
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
    ls.set(`${activeUser?.username}_noStrPrivKey`, keys.priv);
    await setProfileMetaData(props.activeUser, keys.pub);
    setHasUserJoinedChat(true);
    setNostrkeys(keys);
    window.messageService?.updateProfile({
      name: props.activeUser?.username!,
      about: "",
      picture: ""
    });
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
        isCommunityChatJoined ? (
          <Button variant="outline-primary">{_t("chat.chat-joined")}</Button>
        ) : hasUserJoinedChat && !isChatEnabled ? (
          <Button onClick={createCommunityChat}>
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
          <Button onClick={handleJoinChat}>
            {" "}
            {inProgress && chatButtonSpinner}
            {_t("chat.join-chat")}
          </Button>
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
