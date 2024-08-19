import React from "react";
import Link from "next/link";
import { FollowControls } from "@/features/shared";
import i18next from "i18next";
import { dateToFullRelative } from "@/utils";
import { FavouriteBtn } from "@/features/shared/favorite-btn";
import { useGlobalStore } from "@/core/global-store";
import { getAccountFullQuery } from "@/api/queries";
import { ProfilePreviewAbout } from "@/features/shared/profile-popover/profile-preview/profile-preview-about";
import { ProfilePreviewFollowers } from "@/features/shared/profile-popover/profile-preview/profile-preview-followers";
import { ProfilePreviewCellLayout } from "@/features/shared/profile-popover/profile-preview/profile-preview-cell-layout";
import { ProfilePreviewPropertiesRowLayout } from "@/features/shared/profile-popover/profile-preview/profile-preview-properties-row-layout";
import { ProfilePreviewUsername } from "@/features/shared/profile-popover/profile-preview/profile-preview-username";
import { ProfilePreviewCover } from "@/features/shared/profile-popover/profile-preview/profile-preview-cover";
import { ProfilePreviewAvatar } from "@/features/shared/profile-popover/profile-preview/profile-preview-avatar";

interface Props {
  username: string;
}

export const ProfilePreview = ({ username }: Props) => {
  const usePrivate = useGlobalStore((s) => s.usePrivate);
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { data: profile, isLoading: isProfileLoading } =
    getAccountFullQuery(username).useClientQuery();

  return (
    <>
      <ProfilePreviewCover username={username} />
      <div className="absolute top-2 right-2 flex">
        {username !== activeUser?.username && (
          <>
            <FollowControls targetUsername={username} />
            {usePrivate && <FavouriteBtn targetUsername={username} />}
          </>
        )}
      </div>
      <div>
        <ProfilePreviewAvatar username={username} />
        <div className="flex flex-col text-center px-2 md:px-4">
          <ProfilePreviewUsername username={username} />
        </div>
        <div className="w-full">
          <ProfilePreviewPropertiesRowLayout>
            <ProfilePreviewCellLayout
              title={i18next.t("profile-info.joined")}
              isLoading={isProfileLoading}
            >
              {profile && dateToFullRelative(profile.created)}
            </ProfilePreviewCellLayout>

            <ProfilePreviewCellLayout
              title={i18next.t("profile-edit.location")}
              isLoading={isProfileLoading}
            >
              {(profile && profile.profile?.location) || "---"}
            </ProfilePreviewCellLayout>
          </ProfilePreviewPropertiesRowLayout>

          <ProfilePreviewPropertiesRowLayout>
            <ProfilePreviewCellLayout
              title={i18next.t("profile.section-posts")}
              isLoading={isProfileLoading}
            >
              {profile && <Link href={`/@${username}/posts`}>{profile.post_count}</Link>}
            </ProfilePreviewCellLayout>
            <ProfilePreviewCellLayout
              title={i18next.t("profile.voting-power")}
              isLoading={isProfileLoading}
            >
              {profile && profile.voting_power / 100}
            </ProfilePreviewCellLayout>
          </ProfilePreviewPropertiesRowLayout>

          <ProfilePreviewFollowers username={username} />
        </div>
        <ProfilePreviewAbout username={username} />
      </div>
    </>
  );
};
