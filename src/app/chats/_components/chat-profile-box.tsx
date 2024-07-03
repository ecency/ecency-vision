import React, { useMemo } from "react";
import { getCommunityCache } from "@/core/caches";
import { getAccountFullQuery } from "@/api/queries";
import { UserAvatar } from "@/features/shared";
import { dateToFormatted } from "@/utils";
import i18next from "i18next";

export interface ProfileData {
  joiningData: string;
  about: string | undefined;
  followers: number | undefined;
  name: string;
  username: string;
}

interface Props {
  communityName?: string;
  currentUser?: string;
}

export function ChatsProfileBox({ communityName, currentUser }: Props) {
  const { data: community } = getCommunityCache(communityName!).useClientQuery();
  const { data: account } = getAccountFullQuery(currentUser).useClientQuery();

  const profileData = useMemo(() => {
    if (community) {
      return {
        joiningData: community?.created_at!,
        about: community?.about,
        followers: community?.subscribers,
        name: community?.title!,
        username: community?.name!
      };
    } else if (account) {
      return {
        joiningData: account.created,
        about: account.profile?.about,
        followers: account.follow_stats?.follower_count,
        name: account.name,
        username: account.name
      };
    }
    return {};
  }, [community, account]);

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

  return profileData?.joiningData ? (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center p-4 border border-[--border-color] rounded-2xl bg-gray-100 dark:bg-gray-900">
        <UserAvatar username={profileData.username} size="large" />
        <div className="text-gray-800 dark:text-white mt-2 font-semibold">{profileData.name}</div>
        {profileData.about?.length !== 0 && (
          <div className="text-center text-xs">{profileData.about}</div>
        )}

        <div className="grid grid-cols-2 text-center justify-center pt-4 gap-3 text-gray-600">
          <div className="flex flex-col gap-2">
            <div className="text-sm">{i18next.t("chat.joined")}</div>
            <div className="text-blue-dark-sky">
              {dateToFormatted(profileData!.joiningData, "LL")}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm">{i18next.t("chat.subscribers")}</div>
            <div className="text-blue-dark-sky">{formatFollowers(profileData!.followers)}</div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
}
