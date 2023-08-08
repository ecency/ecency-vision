import React, { useEffect, useState, useCallback } from "react";

import { History } from "history";

import { Link } from "react-router-dom";
import { RCAccount } from "@hiveio/dhive/lib/chain/rc";

import { Global } from "../../store/global/types";
import { Account, FullAccount } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";

import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";
import { Followers, Following } from "../friends";

import accountReputation from "../../helper/account-reputation";

import formattedNumber from "../../util/formatted-number";

import defaults from "../../constants/defaults.json";

import { findRcAccounts, rcPower, votingPower } from "../../api/hive";

import { _t } from "../../i18n";

import { nearMeSvg, earthSvg, calendarRangeSvg, rssSvg } from "../../img/svg";

import { EditPic } from "../community-card";
import { getRelationshipBetweenAccounts, getSubscriptions } from "../../api/bridge";
import { Skeleton } from "../skeleton";
import { dateToFormatted } from "../../helper/parse-date";
import isCommunity from "../../helper/is-community";
import { Subscription } from "../../store/subscriptions/types";
import { ResourceCreditsInfo } from "../rc-info";
import "./_index.scss";

interface Props {
  global: Global;
  history: History;
  activeUser: ActiveUser | null;
  account: Account;
  section?: string;
  addAccount: (data: Account) => void;
  updateActiveUser: (data?: Account) => void;
}

export const ProfileCard = (props: Props) => {
  const [followersList, setFollowersList] = useState(false);
  const [followingList, setFollowingList] = useState(false);
  const [followsActiveUser, setFollowsActiveUser] = useState(false);
  const [isMounted, setIsmounted] = useState(false);
  const [followsActiveUserLoading, setFollowsActiveUserLoading] = useState(false);
  const [subs, setSubs] = useState([] as Subscription[]);
  const [rcPercent, setRcPercent] = useState(100);

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({} as any), []);

  const { activeUser, account, section, global } = props;

  useEffect(() => {
    if (activeUser && activeUser.username) {
      setFollowsActiveUserLoading(activeUser && activeUser.username ? true : false);
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
  }, [account]);

  useEffect(() => {
    setIsmounted(true);
    return () => setIsmounted(false);
  }, []);

  useEffect(() => {
    setFollowersList(false);
    setFollowingList(false);
    setFollowsActiveUserLoading(activeUser && activeUser.username ? true : false);
    isMounted && getFollowsInfo(account?.name);
  }, [account?.name]);

  const getFollowsInfo = (username: string) => {
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
  };

  const toggleFollowers = () => {
    setFollowersList(!followersList);
  };

  const toggleFollowing = () => {
    setFollowingList(!followingList);
  };
  const loggedIn = activeUser && activeUser.username;
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
          <EditPic
            {...props}
            account={account as FullAccount}
            activeUser={activeUser!}
            onUpdate={() => {
              forceUpdate();
            }}
          />
        )}
        {account.__loaded && (
          <div className="reputation">{accountReputation(account.reputation!)}</div>
        )}
      </div>

      <h1>
        <div className="username">{account?.name}</div>
      </h1>

      {loggedIn && !isMyProfile && (
        <div className="d-flex justify-content-center mb-3 d-md-block">
          {followsActiveUserLoading ? (
            <Skeleton className="loading-follows-you" />
          ) : followsActiveUser ? (
            <div className="follow-pill d-inline text-lowercase">{_t("profile.follows-you")}</div>
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
        <ResourceCreditsInfo {...props} rcPercent={rcPercent} account={account} />
      </div>

      {account.__loaded && (
        <div className="stats">
          {account.follow_stats?.follower_count !== undefined && (
            <div className="stat followers">
              <Tooltip content={_t("profile.followers")}>
                <span onClick={toggleFollowers}>
                  {formattedNumber(account.follow_stats.follower_count, { fractionDigits: 0 })}{" "}
                  {_t("profile.followers")}
                </span>
              </Tooltip>
            </div>
          )}

          {account.follow_stats?.following_count !== undefined && (
            <div className="stat following">
              <Tooltip content={_t("profile.following")}>
                <span onClick={toggleFollowing}>
                  {formattedNumber(account.follow_stats.following_count, { fractionDigits: 0 })}{" "}
                  {_t("profile.following")}
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
          <div className="com-title">{_t("profile.com-mod")}</div>
          {subs.map((x) => (
            <Link className="prop" key={x[0]} to={`/created/${x[0]}`}>
              {x[1]}
            </Link>
          ))}
        </div>
      )}
      <div className="btn-controls">
        {isCommunity(account?.name) && (
          <Link className="btn btn-sm btn-primary" to={`/created/${account?.name}`}>
            {_t("profile.go-community")}
          </Link>
        )}
        {isMyProfile && (
          <>
            {global.usePrivate && (
              <Link className="btn btn-sm btn-primary" to={`/@${account?.name}/referrals`}>
                {_t("profile.referrals")}
              </Link>
            )}
            <Link className="btn btn-sm btn-primary" to="/witnesses">
              {_t("profile.witnesses")}
            </Link>
            <Link className="btn btn-sm btn-primary" to="/proposals">
              {_t("profile.proposals")}
            </Link>
          </>
        )}
      </div>

      {followersList && <Followers {...props} account={account} onHide={toggleFollowers} />}
      {followingList && <Following {...props} account={account} onHide={toggleFollowing} />}
    </div>
  );
};

export default (p: Props) => {
  const props: Props = {
    global: p.global,
    history: p.history,
    activeUser: p.activeUser,
    account: p.account,
    section: p.section,
    addAccount: p.addAccount,
    updateActiveUser: p.updateActiveUser
  };

  return <ProfileCard {...props} />;
};
