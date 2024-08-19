import { Skeleton } from "@/features/shared";
import i18next from "i18next";
import Link from "next/link";
import React, { useMemo } from "react";
import { getAccountFullQuery, useGetRelationshipBtwAccounts } from "@/api/queries";
import { accountReputation } from "@/utils";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  username: string;
}

export function ProfilePreviewUsername({ username }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { data: profile, isLoading: isProfileLoading } =
    getAccountFullQuery(username).useClientQuery();

  const { data: relationsBetweenAccounts, isLoading: followsActiveUserLoading } =
    useGetRelationshipBtwAccounts(username, activeUser!.username);

  const followsActiveUser = useMemo(
    () => relationsBetweenAccounts?.follows ?? false,
    [relationsBetweenAccounts?.follows]
  );
  const reputation = useMemo(() => profile && accountReputation(profile.reputation), [profile]);

  return (
    <>
      <div>
        {isProfileLoading ? <Skeleton className="loading-md" /> : profile && profile.profile?.name}
      </div>
      <Link href={`/@${username}`}>
        {isProfileLoading ? (
          <Skeleton className="loading-md my-3" />
        ) : (
          `@${username} (${reputation})`
        )}
      </Link>
      <div>
        {activeUser && followsActiveUserLoading ? (
          <Skeleton className="loading-md my-3" />
        ) : followsActiveUser ? (
          i18next.t("profile.follows-you")
        ) : null}
      </div>
    </>
  );
}
