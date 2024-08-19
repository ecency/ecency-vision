import i18next from "i18next";
import React from "react";
import { useGetFollowCount } from "@/api/queries";
import { ProfilePreviewCellLayout } from "@/features/shared/profile-popover/profile-preview/profile-preview-cell-layout";
import { ProfilePreviewPropertiesRowLayout } from "@/features/shared/profile-popover/profile-preview/profile-preview-properties-row-layout";

interface Props {
  username: string;
}

export function ProfilePreviewFollowers({ username }: Props) {
  const { data: followCount, isLoading: loadingFollowCount } = useGetFollowCount(username);

  return (
    <ProfilePreviewPropertiesRowLayout>
      <ProfilePreviewCellLayout
        title={i18next.t("profile.followers")}
        isLoading={loadingFollowCount}
      >
        {followCount && followCount.follower_count}
      </ProfilePreviewCellLayout>
      <ProfilePreviewCellLayout
        title={i18next.t("profile.following")}
        isLoading={loadingFollowCount}
      >
        {followCount && followCount.following_count}
      </ProfilePreviewCellLayout>
    </ProfilePreviewPropertiesRowLayout>
  );
}
