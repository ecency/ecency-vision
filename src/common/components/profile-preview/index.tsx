import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRelationshipBetweenAccounts } from "../../api/bridge";
import { getAccount, getFollowCount } from "../../api/hive";
import accountReputation from "../../helper/account-reputation";
import { dateToFullRelative } from "../../helper/parse-date";
import { _t } from "../../i18n";
import { closeSvg } from "../../img/svg";
import { FavoriteBtn } from "../favorite-btn";
import FollowControls from "../follow-controls";
import { Skeleton } from "../skeleton";
import "./index.scss";
import { useMappedStore } from "../../store/use-mapped-store";

interface Props {
  username: string;
  onClose: (e: any, donotSetState?: boolean) => void;
}

export const ProfilePreview = ({ username, onClose }: Props) => {
  const {
    global,
    users,
    activeUser,
    ui,
    setActiveUser,
    updateActiveUser,
    deleteUser,
    toggleUIProp
  } = useMappedStore();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [followCount, setFollowCount] = useState<any>(null);
  const [loadingFollowCount, setLoadingFollowCount] = useState(false);
  const [isMounted, setIsmounted] = useState(false);
  const [followsActiveUser, setFollowsActiveUser] = useState(false);
  const [followsActiveUserLoading, setFollowsActiveUserLoading] = useState(false);

  useEffect(() => {
    setLoadingFollowCount(true);
    setIsmounted(true);
    setFollowsActiveUserLoading(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setLoading(true);
      setFollowsActiveUserLoading(true);
      getAccount(username)
        .then((profile) => {
          if (isMounted) {
            setProfile(profile);
            setLoading(false);
          }
        })
        .catch((err) => isMounted && setLoading(false));

      getFollowCount(username)
        .then((res) => {
          if (isMounted) {
            setFollowCount(res);
            setLoadingFollowCount(false);
          }
        })
        .catch((err) => isMounted && setLoadingFollowCount(false));
      let loggedIn = activeUser && activeUser.username;
      if (loggedIn) {
        getRelationshipBetweenAccounts(username, activeUser!.username)
          .then((res) => {
            setFollowsActiveUserLoading(false);
            setFollowsActiveUser(res!.follows);
          })
          .catch((err) => setFollowsActiveUserLoading(false));
      }
    }
  }, [username, isMounted]);

  useEffect(() => {
    if (isMounted) {
      return () => setIsmounted(false);
    }
    return () => {};
  }, []);

  const coverFallbackDay = global.isElectron
    ? "./img/cover-fallback-day.png"
    : require("../../img/cover-fallback-day.png");
  const coverFallbackNight = global.isElectron
    ? "./img/cover-fallback-night.png"
    : require("../../img/cover-fallback-night.png");
  const reputation = profile && accountReputation(profile.reputation);
  const loggedIn = activeUser && activeUser.username;

  return isMounted ? (
    <div className="profile-parent">
      <div className="shadow bg-white profile-container rounded">
        <div className="close-icon rounded-circle" onClick={onClose}>
          {closeSvg}
        </div>
        <>
          {loading ? (
            <Skeleton className="cover-img-placeholder rounded-top" />
          ) : (
            profile && (
              <img
                src={
                  profile.profile.cover_image
                    ? `https://images.ecency.com/${
                        global.canUseWebp ? "webp/" : ""
                      }u/${username}/cover`
                    : global.theme === "day"
                    ? coverFallbackDay
                    : coverFallbackNight
                }
                className="w-100 cover-img rounded-top"
                loading="lazy"
              />
            )
          )}
          <div className="p-3 upper-container">
            <div className="d-flex align-items-center info-container flex-column text-center">
              <div
                className={`rounded-circle mb-3 profile-img-container ${
                  profile && profile.profile.profile_image ? "" : "no-image"
                }`}
              >
                {loading ? (
                  <Skeleton className="profile-img rounded-circle" />
                ) : (
                  profile && (
                    <Link to={`/@${username}`} onClick={(e) => onClose(e, true)}>
                      <img
                        src={`https://images.ecency.com/${
                          global.canUseWebp ? "webp/" : ""
                        }u/${username}/avatar/medium`}
                        alt="img"
                        className="profile-img rounded-circle bg-primary"
                        loading="lazy"
                      />
                    </Link>
                  )
                )}
              </div>
              <div className="d-flex flex-column align-items-center">
                <Link to={`/@${username}`} onClick={(e) => onClose(e, true)}>
                  <div>
                    {loading ? (
                      <Skeleton className="loading-md" />
                    ) : (
                      profile && profile.profile.name
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
                      _t("profile.follows-you")
                    ) : null}
                  </div>
                </Link>
                {username !== activeUser?.username && (
                  <div className="d-flex mt-3">
                    <>
                      <FollowControls
                        ui={ui}
                        updateActiveUser={updateActiveUser}
                        users={users}
                        deleteUser={deleteUser}
                        setActiveUser={setActiveUser}
                        toggleUIProp={toggleUIProp}
                        targetUsername={username}
                        activeUser={activeUser}
                      />
                      {global.usePrivate && (
                        <FavoriteBtn
                          ui={ui}
                          updateActiveUser={updateActiveUser}
                          users={users}
                          deleteUser={deleteUser}
                          setActiveUser={setActiveUser}
                          toggleUIProp={toggleUIProp}
                          activeUser={activeUser}
                          targetUsername={username}
                        />
                      )}
                    </>
                  </div>
                )}
              </div>
            </div>
            <div className="d-flex justify-content-between flex-wrap">
              <div className="flex-grow-1 d-flex border-bottom">
                <div className="p-3 flex-grow-1">
                  <b>{_t("profile-info.joined")}</b>
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
                    loading ? "" : profile && profile.profile.location ? "" : "d-none"
                  }`}
                >
                  <b>{_t("profile-edit.location")}</b>
                  <div className="text-break-wrap">
                    {loading ? (
                      <Skeleton className="loading-md" />
                    ) : (
                      (profile && profile.profile.location) || "---"
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-grow-1 d-flex border-bottom">
                <div className="p-3 flex-grow-1">
                  <b>{_t("profile.section-posts")}</b>
                  <div className="text-break-wrap">
                    {loading ? (
                      <Skeleton className="loading-md" />
                    ) : (
                      profile && (
                        <Link to={`/@${username}/posts`} onClick={(e) => onClose(e, true)}>
                          {profile.post_count}
                        </Link>
                      )
                    )}
                  </div>
                </div>

                <div className="p-3 flex-grow-1">
                  <b>{_t("profile.voting-power")}</b>
                  <div className="text-break-wrap">
                    {loading ? (
                      <Skeleton className="loading-md" />
                    ) : (
                      profile && profile.voting_power / 100
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-grow-1 d-flex border-bottom">
                <div className="p-3 flex-grow-1">
                  <b>{_t("profile.followers")}</b>
                  <div className="text-break-wrap">
                    {loadingFollowCount ? (
                      <Skeleton className="loading-md" />
                    ) : (
                      followCount && followCount.follower_count
                    )}
                  </div>
                </div>

                <div className="p-3 flex-grow-1">
                  <b>{_t("profile.following")}</b>
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
              <b className={`${loading ? "" : profile && profile.profile.about ? "" : "d-none"}`}>
                {_t("profile-edit.about")}
              </b>
              <div className="limited-about-text">
                {loading ? (
                  <Skeleton className="loading-md" />
                ) : profile && profile.profile.about ? (
                  profile.profile.about.length > 55 ? (
                    <Link to={`/@${username}`} onClick={(e) => onClose(e, true)}>
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
