import React, { useEffect, useState } from "react";
import UserAvatar from "../../user-avatar";

import "./index.scss";
import { dateToFormatted } from "../../../helper/parse-date";
import { _t } from "../../../i18n";
import { useMappedStore } from "../../../store/use-mapped-store";
import { getAccountFull } from "../../../api/hive";
import { getCommunity } from "../../../api/bridge";
import { formattedUserName } from "../utils";
import { useCommunityCache } from "../../../core/caches/communities-cache";

export interface profileData {
  joiningData: string;
  about: string | undefined;
  followers: number | undefined;
  name: string;
  subscribers: string;
  username: string;
}

interface Props {
  username?: string;
  isCommunity?: boolean;
  isCurrentUser?: boolean;
  communityName?: string;
  currentUser?: string;
}

export default function ChatsProfileBox(props: Props) {
  const { username, isCommunity, isCurrentUser, communityName, currentUser } = props;
  const { chat, activeUser } = useMappedStore();

  const [profileData, setProfileData] = useState<profileData>();

  const { data: community } = useCommunityCache(username ? username! : communityName!);

  // useEffect(() => {
  //   if (community) {
  //     console.log("Community 1st", community);
  //   }
  // }, [community, communityName]);

  useEffect(() => {
    fetchProfileData();
  }, [username, isCommunity, isCurrentUser, communityName, currentUser]);

  const formatFollowers = (count: number | undefined) => {
    if (count) {
      return count >= 1e6
        ? (count / 1e6).toLocaleString() + "M"
        : count >= 1e3
        ? (count / 1e3).toLocaleString() + "K"
        : count.toLocaleString();
    }
    return count;
  };

  const fetchProfileData = async () => {
    if (username && username?.length !== 0) {
      if (username?.startsWith("@")) {
        const response = await getAccountFull(formattedUserName(username));
        setProfileData({
          joiningData: response.created,
          about: response.profile?.about,
          followers: response.follow_stats?.follower_count,
          name: response.name,
          subscribers: _t("chat.followers"),
          username: response.name
        });
      } else {
        setProfileData({
          joiningData: community?.created_at!,
          about: community?.about,
          followers: community?.subscribers,
          name: community?.title!,
          subscribers: _t("chat.subscribers"),
          username: community?.name!
        });
      }
    } else {
      if (isCurrentUser && currentUser?.length !== 0) {
        const response = await getAccountFull(currentUser!);
        setProfileData({
          joiningData: response.created,
          about: response.profile?.about,
          followers: response.follow_stats?.follower_count,
          name: response.name,
          subscribers: _t("chat.followers"),
          username: response.name
        });
      } else {
        setProfileData({
          joiningData: community?.created_at!,
          about: community?.about,
          followers: community?.subscribers,
          name: community?.title!,
          subscribers: _t("chat.subscribers"),
          username: community?.name!
        });
      }
    }
  };

  return (
    <div className="chats-profile-box">
      <div className="user-profile">
        {profileData?.joiningData && (
          <div className="user-profile-data">
            <span className="user-logo">
              <UserAvatar username={profileData.username} size="large" />
            </span>
            <h4 className="user-name user-logo ">{profileData.name}</h4>
            {profileData.about?.length !== 0 && (
              <p className="about user-logo ">{profileData.about}</p>
            )}

            <div className="created-date user-logo joining-info">
              <p>
                {" "}
                {_t("chat.joined")} {dateToFormatted(profileData!.joiningData, "LL")}
              </p>
              <p className="followers">
                {" "}
                {formatFollowers(profileData!.followers)} {profileData.subscribers}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
