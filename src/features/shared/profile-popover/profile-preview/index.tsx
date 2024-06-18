import React, { useEffect, useMemo, useState } from "react";
import "./index.scss";
import Link from "next/link";
import { FollowControls, Skeleton } from "@/features/shared";
import i18next from "i18next";
import { accountReputation, dateToFullRelative } from "@/utils";
import { FavouriteBtn } from "@/features/shared/favorite-btn";
import { useGlobalStore } from "@/core/global-store";
import { closeSvg } from "@ui/svg";
import {
  getAccountFullQuery,
  useGetFollowCount,
  useGetRelationshipBtwAccounts
} from "@/api/queries";
import Image from "next/image";

interface Props {
  username: string;
  onClose: (e: any, donotSetState?: boolean) => void;
}

export const ProfilePreview = ({ username, onClose }: Props) => {
  const usePrivate = useGlobalStore((s) => s.usePrivate);
  const activeUser = useGlobalStore((s) => s.activeUser);
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);
  const theme = useGlobalStore((s) => s.theme);

  const [loading, setLoading] = useState(false);
  const [isMounted, setIsmounted] = useState(false);

  const { data: profile } = getAccountFullQuery(username).useClientQuery();
  const { data: followCount, isLoading: loadingFollowCount } = useGetFollowCount(username);
  const { data: relationsBetweenAccounts, isLoading: followsActiveUserLoading } =
    useGetRelationshipBtwAccounts(username, activeUser!.username);

  const followsActiveUser = useMemo(
    () => relationsBetweenAccounts?.follows ?? false,
    [relationsBetweenAccounts?.follows]
  );

  useEffect(() => {
    setIsmounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      return () => setIsmounted(false);
    }
    return () => {};
  }, [isMounted]);

  const reputation = profile && accountReputation(profile.reputation);
  const loggedIn = activeUser && activeUser.username;

  return isMounted ? (
    <div className="profile-parent">
      <div className="shadow bg-white profile-container rounded">
        <div className="close-icon rounded-[50%]" onClick={onClose}>
          {closeSvg}
        </div>
        <>
          {loading ? (
            <Skeleton className="cover-img-placeholder rounded-t" />
          ) : (
            profile && (
              <Image
                alt=""
                width={600}
                height={600}
                src={
                  profile.profile?.cover_image
                    ? `https://images.ecency.com/${canUseWebp ? "webp/" : ""}u/${username}/cover`
                    : theme === "day"
                      ? "/assets/img/cover-fallback-day.png"
                      : "/assets/img/cover-fallback-night.png"
                }
                className="w-full cover-img rounded-t"
                loading="lazy"
              />
            )
          )}
          <div className="p-3 upper-container">
            <div className="flex items-center info-container flex-col text-center">
              <div
                className={`rounded-[50%] mb-3 profile-img-container ${
                  profile && profile.profile?.profile_image ? "" : "no-image"
                }`}
              >
                {loading ? (
                  <Skeleton className="profile-img rounded-[50%]" />
                ) : (
                  profile && (
                    <Link href={`/@${username}`} onClick={(e) => onClose(e, true)}>
                      <img
                        src={`https://images.ecency.com/${
                          canUseWebp ? "webp/" : ""
                        }u/${username}/avatar/medium`}
                        alt="img"
                        className="profile-img rounded-[50%] bg-primary"
                        loading="lazy"
                      />
                    </Link>
                  )
                )}
              </div>
              <div className="flex flex-col items-center">
                <Link href={`/@${username}`} onClick={(e) => onClose(e, true)}>
                  <div>
                    {loading ? (
                      <Skeleton className="loading-md" />
                    ) : (
                      profile && profile.profile?.name
                    )}
                  </div>
                  <div>
                    {loading ? (
                      <Skeleton className="loading-md my-3" />
                    ) : (
                      `@${username} (${reputation})`
                    )}
                  </div>
                  <div>
                    {loggedIn && followsActiveUserLoading ? (
                      <Skeleton className="loading-md my-3" />
                    ) : followsActiveUser ? (
                      i18next.t("profile.follows-you")
                    ) : null}
                  </div>
                </Link>
                {username !== activeUser?.username && (
                  <div className="flex mt-3">
                    <>
                      <FollowControls targetUsername={username} />
                      {usePrivate && <FavouriteBtn targetUsername={username} />}
                    </>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between flex-wrap">
              <div className="flex-grow-1 flex border-b border-[--border-color]">
                <div className="p-3 flex-grow-1">
                  <b>{i18next.t("profile-info.joined")}</b>
                  <div className="text-break-wrap">
                    {loading ? (
                      <Skeleton className="loading-md" />
                    ) : (
                      profile && dateToFullRelative(profile.created)
                    )}
                  </div>
                </div>

                <div
                  className={`p-3 flex-grow-1 ${
                    loading ? "" : profile && profile.profile?.location ? "" : "hidden"
                  }`}
                >
                  <b>{i18next.t("profile-edit.location")}</b>
                  <div className="text-break-wrap">
                    {loading ? (
                      <Skeleton className="loading-md" />
                    ) : (
                      (profile && profile.profile?.location) || "---"
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-grow-1 flex border-b border-[--border-color]">
                <div className="p-3 flex-grow-1">
                  <b>{i18next.t("profile.section-posts")}</b>
                  <div className="text-break-wrap">
                    {loading ? (
                      <Skeleton className="loading-md" />
                    ) : (
                      profile && (
                        <Link href={`/@${username}/posts`} onClick={(e) => onClose(e, true)}>
                          {profile.post_count}
                        </Link>
                      )
                    )}
                  </div>
                </div>

                <div className="p-3 flex-grow-1">
                  <b>{i18next.t("profile.voting-power")}</b>
                  <div className="text-break-wrap">
                    {loading ? (
                      <Skeleton className="loading-md" />
                    ) : (
                      profile && profile.voting_power / 100
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-grow-1 flex border-b border-[--border-color]">
                <div className="p-3 flex-grow-1">
                  <b>{i18next.t("profile.followers")}</b>
                  <div className="text-break-wrap">
                    {loadingFollowCount ? (
                      <Skeleton className="loading-md" />
                    ) : (
                      followCount && followCount.follower_count
                    )}
                  </div>
                </div>

                <div className="p-3 flex-grow-1">
                  <b>{i18next.t("profile.following")}</b>
                  <div className="text-break-wrap">
                    {loadingFollowCount ? (
                      <Skeleton className="loading-md" />
                    ) : (
                      followCount && followCount.following_count
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={`p-3 about-container`}>
              <b className={`${loading ? "" : profile && profile.profile?.about ? "" : "hidden"}`}>
                {i18next.t("profile-edit.about")}
              </b>
              <div className="limited-about-text">
                {loading ? (
                  <Skeleton className="loading-md" />
                ) : profile && profile.profile?.about ? (
                  profile.profile.about.length > 55 ? (
                    <Link href={`/@${username}`} onClick={(e) => onClose(e, true)}>
                      {profile.profile.about}
                    </Link>
                  ) : (
                    profile.profile.about
                  )
                ) : null}
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  ) : null;
};
