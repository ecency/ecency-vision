import React, { useEffect, useState } from "react";
import UserAvatar from "../../../../components/user-avatar";
import { dateToFormatted } from "../../../../helper/parse-date";
import { _t } from "../../../../i18n";
import { getAccountFull } from "../../../../api/hive";
import { formattedUserName } from "../../utils";
import { useCommunityCache } from "../../../../core";

export interface profileData {
  joiningData: string;
  about: string | undefined;
  followers: number | undefined;
  name: string;
  username: string;
}

interface Props {
  username?: string;
  isCommunity?: boolean;
  isCurrentUser?: boolean;
  communityName?: string;
  currentUser?: string;
}

export default function ChatsProfileBox({
  username,
  isCommunity,
  isCurrentUser,
  communityName,
  currentUser
}: Props) {
  const [profileData, setProfileData] = useState<profileData>();

  const { data: community } = useCommunityCache(username ? username! : communityName!);

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
          username: response.name
        });
      } else {
        setProfileData({
          joiningData: community?.created_at!,
          about: community?.about,
          followers: community?.subscribers,
          name: community?.title!,
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
          username: response.name
        });
      } else {
        setProfileData({
          joiningData: community?.created_at!,
          about: community?.about,
          followers: community?.subscribers,
          name: community?.title!,
          username: community?.name!
        });
      }
    }
  };

  return profileData?.joiningData ? (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center p-4 border border-[--border-color] rounded-2xl bg-gray-100 dark:bg-gray-800">
        <UserAvatar username={profileData.username} size="large" />
        <div className="text-gray-800 mt-2 font-semibold">{profileData.name}</div>
        {profileData.about?.length !== 0 && <div>{profileData.about}</div>}

        <div className="grid grid-cols-2 text-center justify-center pt-4 gap-3 text-gray-600">
          <div className="flex flex-col gap-2">
            <div className="text-sm">{_t("chat.joined")}</div>
            <div className="text-blue-dark-sky">
              {dateToFormatted(profileData!.joiningData, "LL")}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm">{_t("chat.subscribers")}</div>
            <div className="text-blue-dark-sky">{formatFollowers(profileData!.followers)}</div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}
