"use client";

import React, { useCallback, useEffect, useState } from "react";
import { RCAccount } from "@hiveio/dhive/lib/chain/rc";
import defaults from "@/defaults.json";
import "./_index.scss";
import { Button } from "@ui/button";
import { Account, FullAccount, Subscription } from "@/entities";
import Link from "next/link";
import i18next from "i18next";
import { JoinCommunityChatBtn } from "@/app/chats/_components/join-community-chat-btn";
import { accountReputation, dateToFormatted, formattedNumber, isCommunity } from "@/utils";
import { calendarRangeSvg, earthSvg, nearMeSvg, rssSvg } from "@ui/svg";
import { Tooltip } from "@ui/tooltip";
import { ResourceCreditsInfo } from "../rc-info";
import { Skeleton, UserAvatar } from "@/features/shared";
import { findRcAccounts, rcPower } from "@/api/hive";
import { getRelationshipBetweenAccounts, getSubscriptions } from "@/api/bridge";
import { useGlobalStore } from "@/core/global-store";
import { getCommunityCache } from "@/core/caches";
import { CommunityCardEditPic } from "@/app/[filterOrCategory]/[entryOrCommunity]/_components/community-card/community-card-edit-pic";
import { Followers, Following } from "../friends";

interface Props {
  account: Account;
  section?: string;
}

export const ProfileCard = ({ account, section }: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  const [followersList, setFollowersList] = useState(false);
  const [followingList, setFollowingList] = useState(false);
  const [followsActiveUser, setFollowsActiveUser] = useState(false);
  const [followsActiveUserLoading, setFollowsActiveUserLoading] = useState(false);
  const [subs, setSubs] = useState([] as Subscription[]);
  const [rcPercent, setRcPercent] = useState(100);

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({} as any), []);

  const { data: community } = getCommunityCache(account?.name).useClientQuery();

  const getFollowsInfo = useCallback(
    (username: string) => {
      if (activeUser) {
        getRelationshipBetweenAccounts(username, activeUser.username)
          .then((res) => {
            setFollowsActiveUserLoading(false);
            setFollowsActiveUser(res?.follows || false);
          })
          .catch((error) => {
            setFollowsActiveUserLoading(false);
            setFollowsActiveUser(false);
          });
      }
    },
    [activeUser]
  );

  const toggleFollowers = () => {
    setFollowersList(!followersList);
  };

  const toggleFollowing = () => {
    setFollowingList(!followingList);
  };
  const loggedIn = activeUser && activeUser.username;

  useEffect(() => {
    setFollowersList(false);
    setFollowingList(false);
    setFollowsActiveUserLoading(!!(activeUser && activeUser.username));
    getFollowsInfo(account?.name);
  }, [account?.name, activeUser, getFollowsInfo]);

  useEffect(() => {
    if (activeUser && activeUser.username) {
      setFollowsActiveUserLoading(!!(activeUser && activeUser.username));
      getFollowsInfo(account?.name);
    }
    getSubscriptions(account?.name)
      .then((r) => {
        if (r) {
          const communities = r.filter((x) => x[2] === "mod" || x[2] === "admin");
          setSubs(communities);
        }
      })
      .catch((e) => {
        setSubs([]);
      });
    findRcAccounts(account?.name)
      .then((r: RCAccount[]) => {
        if (r && r[0]) {
          setRcPercent(rcPower(r[0]));
        }
      })
      .catch((e) => {
        setRcPercent(100);
      });
  }, [account, activeUser, getFollowsInfo]);

  // TODO: use better conditions throughout app than .__loaded, remove all instances that rely on .__loaded
  if (!account?.__loaded) {
    return (
      <div className="profile-card">
        <div className="profile-avatar">
          <UserAvatar username={account?.name} size="xLarge" />
        </div>

        <h1>
          <div className="username">{account?.name}</div>
        </h1>
      </div>
    );
  }

  const isMyProfile =
    activeUser &&
    activeUser.username === account?.name &&
    activeUser.data.__loaded &&
    activeUser.data.profile;
  const isSettings = section === "settings";

  return (
    <div className="profile-card">
      <div className="profile-avatar">
        <UserAvatar username={account?.name} size="xLarge" src={account.profile?.profile_image} />
        {isMyProfile && isSettings && (
          <CommunityCardEditPic account={account as FullAccount} onUpdate={() => forceUpdate()} />
        )}
        {account.__loaded && (
          <div className="reputation">{accountReputation(account.reputation!)}</div>
        )}
      </div>

      <h1>
        <div className="username">{account?.name}</div>
      </h1>

      {loggedIn && !isMyProfile && (
        <div className="flex mb-3">
          {followsActiveUserLoading ? (
            <Skeleton className="loading-follows-you" />
          ) : followsActiveUser ? (
            <div className="follow-pill inline lowercase">{i18next.t("profile.follows-you")}</div>
          ) : null}
        </div>
      )}

      {(account.profile?.name || account.profile?.about) && (
        <div className="basic-info">
          {account.profile?.name && <div className="full-name">{account.profile.name}</div>}
          {account.profile?.about && <div className="about">{account.profile.about}</div>}
        </div>
      )}

      <div>
        <ResourceCreditsInfo rcPercent={rcPercent} account={account} />
      </div>

      {account.__loaded && (
        <div className="stats">
          {account.follow_stats?.follower_count !== undefined && (
            <div className="stat followers">
              <Tooltip content={i18next.t("profile.followers")}>
                <span onClick={toggleFollowers}>
                  {formattedNumber(account.follow_stats.follower_count, { fractionDigits: 0 })}{" "}
                  {i18next.t("profile.followers")}
                </span>
              </Tooltip>
            </div>
          )}

          {account.follow_stats?.following_count !== undefined && (
            <div className="stat following">
              <Tooltip content={i18next.t("profile.following")}>
                <span onClick={toggleFollowing}>
                  {formattedNumber(account.follow_stats.following_count, { fractionDigits: 0 })}{" "}
                  {i18next.t("profile.following")}
                </span>
              </Tooltip>
            </div>
          )}
        </div>
      )}

      <div className="extra-props">
        {account.profile?.location && (
          <div className="prop">
            {nearMeSvg} {account.profile.location}
          </div>
        )}

        {account.profile?.website && (
          <div className="prop">
            {earthSvg}
            <a
              target="_external"
              className="website-link"
              href={`https://${account.profile.website.replace(/^(https?|ftp):\/\//, "")}`}
            >
              {account.profile.website}
            </a>
          </div>
        )}

        {account.created && (
          <div className="prop">
            {calendarRangeSvg} {dateToFormatted(account.created, "LL")}
          </div>
        )}

        <div className="prop">
          {rssSvg}
          <a target="_external" href={`${defaults.base}/@${account?.name}/rss`}>
            RSS feed
          </a>
        </div>
      </div>

      {subs.length > 0 && (
        <div className="com-props">
          <div className="com-title">{i18next.t("profile.com-mod")}</div>
          {subs.map((x) => (
            <Link className="prop" key={x[0]} href={`/created/${x[0]}`}>
              {x[1]}
            </Link>
          ))}
        </div>
      )}
      <div className="btn-controls flex flex-wrap gap-3">
        {isCommunity(account?.name) && (
          <>
            <Link href={`/created/${account?.name}`}>
              <Button size="sm">{i18next.t("profile.go-community")}</Button>
            </Link>
            {!!community && <JoinCommunityChatBtn community={community} />}
          </>
        )}
        {isMyProfile && (
          <>
            {usePrivate && (
              <Link href={`/@${account?.name}/referrals`}>
                <Button size="sm">{i18next.t("profile.referrals")}</Button>
              </Link>
            )}
            <Link href="/witnesses">
              <Button size="sm">{i18next.t("profile.witnesses")}</Button>
            </Link>
            <Link href="/proposals">
              <Button size="sm">{i18next.t("profile.proposals")}</Button>
            </Link>
          </>
        )}
      </div>

      {followersList && <Followers account={account} onHide={toggleFollowers} />}
      {followingList && <Following account={account} onHide={toggleFollowing} />}
    </div>
  );
};
