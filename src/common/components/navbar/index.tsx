import React, { useEffect, useRef, useState } from "react";
import { History } from "history";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import queryString from "query-string";
import { FullAccount } from "../../store/accounts/types";
import NotificationHandler from "../notification-handler";
import SwitchLang from "../switch-lang";
import ToolTip from "../tooltip";
import Search from "../search";
import Login from "../login";
import UserNav from "../user-nav";
import UserNotifications from "../notifications";
import Gallery from "../gallery";
import Drafts from "../drafts";
import Bookmarks from "../bookmarks";
import Schedules from "../schedules";
import Fragments from "../fragments";
import { _t } from "../../i18n";
import _c from "../../util/fix-class-names";
import * as ls from "../../util/local-storage";

import {
  brightnessSvg,
  closeSvg,
  downArrowSvg,
  globeSvg,
  keySvg,
  magnifySvg,
  menuSvg,
  moonSvg,
  notificationSvg,
  pencilOutlinedSvg,
  pencilOutlineSvg,
  rocketSvg,
  sunSvg,
  upArrowSvg,
  userOutlineSvg,
  walletSvg
} from "../../img/svg";
import UserAvatar from "../user-avatar";
import { downVotingPower, votingPower } from "../../api/hive";
import isCommunity from "../../helper/is-community";
import { PurchaseQrDialog } from "../purchase-qr";
import { useMappedStore } from "../../store/use-mapped-store";
import { useLocation } from "react-router";
import usePrevious from "react-use/lib/usePrevious";
import { Theme } from "../../store/global/types";
import "./_index.scss";

const GLOBAL_FILTERS = [
  "engine",
  "wallet",
  "points",
  "communities",
  "settings",
  "permissions",
  "comments",
  "replies",
  "blog",
  "posts",
  "feed",
  "referrals",
  "followers",
  "following",
  "trail"
];

interface Props {
  match?: any;
  history: History;
  step?: number;
  setStepOne?: () => void;
  setStepTwo?: () => void;
}

export default ({ match, history, setStepOne, setStepTwo, step }: Props) => {
  const { activeUser, global, ui, setActiveUser, toggleUIProp, toggleTheme } = useMappedStore();
  const location = useLocation();

  const [transparentVerify, setTransparentVerify] = useState(false);
  const [logoHref, setLogoHref] = useState("/");
  const [themeText, setThemeText] = useState("");
  const [smVisible, setSmVisible] = useState(false);
  const [floating, setFloating] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [drafts, setDrafts] = useState(false);
  const [bookmarks, setBookmarks] = useState(false);
  const [schedules, setSchedules] = useState(false);
  const [fragments, setFragments] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const previousLocation = usePrevious(location);
  const previousActiveUser = usePrevious(activeUser);
  const previousSmVisible = usePrevious(smVisible);

  const navRef = useRef<any>();

  const logo = global.isElectron ? "./img/logo-circle.svg" : require("../../img/logo-circle.svg");

  useEffect(() => {
    // referral check / redirect
    const qs = queryString.parse(location.search);
    if (location.pathname.startsWith("/signup") && qs.referral) {
      history.push(`/signup?referral=${qs.referral}`);
    }
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", handleSetTheme);

    return () => {
      document.getElementsByTagName("body")[0].classList.remove("overflow-hidden");
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleSetTheme);
    };
  }, []);

  useEffect(() => {
    if (previousSmVisible !== smVisible) {
      if (smVisible) {
        document.getElementsByTagName("body")[0].classList.add("overflow-hidden");
      } else {
        document.getElementsByTagName("body")[0].classList.remove("overflow-hidden");
      }
    }
  }, [smVisible]);

  useEffect(() => {
    if (previousLocation?.pathname !== location.pathname || previousActiveUser !== activeUser) {
      if (location.pathname === "/" && !activeUser) {
        setStepOne && setStepOne();
      } else {
        setStepTwo && setStepTwo();
      }
    }
  }, [location, activeUser]);

  useEffect(() => {
    const is =
      location.pathname?.startsWith("/hot") ||
      location.pathname?.startsWith("/created") ||
      location.pathname?.startsWith("/trending");
    setTransparentVerify(is);
  }, [location]);

  useEffect(() => {
    const isCommunityPage = match?.params.name && isCommunity(match.params.name);
    const tagValue = global.tag ? `/${global.tag}` : "";

    if (activeUser) {
      const isFilter = global.tag.includes("@") && GLOBAL_FILTERS.includes(global.filter);

      if (isCommunityPage || isFilter) {
        setLogoHref("/hot");
      } else if (global.filter === "feed") {
        setLogoHref(`${tagValue}/${global.filter}`);
      } else {
        setLogoHref(`/${global.filter}${tagValue}`);
      }
    } else {
      setLogoHref("/");
    }
  }, [activeUser, match, global.tag]);

  useEffect(() => {
    setThemeText(global.theme == Theme.day ? _t("navbar.night-theme") : _t("navbar.day-theme"));
  }, [global.theme]);

  const textMenu = (
    <div className="text-menu">
      <Link className="menu-item mt-0" to="/discover">
        {_t("navbar.discover")}
      </Link>
      <Link className="menu-item mt-0" to="/communities">
        {_t("navbar.communities")}
      </Link>
      {global.usePrivate && (
        <Link className="menu-item mt-0" to="/decks">
          {_t("navbar.decks")}
        </Link>
      )}
    </div>
  );

  const handleSetTheme = () => {
    const useSystem = ls.get("use_system_theme", false);
    let theme = ls.get("theme");
    if (useSystem) {
      theme =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? Theme.night
          : Theme.day;
    }
    toggleTheme(theme);
  };

  const changeTheme = () => {
    ls.remove("use_system_theme");
    toggleTheme();
  };

  const toggleSmVisible = () => {
    setSmVisible(!smVisible);
    if (!smVisible) {
      let rootElement = document.getElementById("root");
      rootElement && rootElement.scrollIntoView();
    }
  };

  const handleIconClick = () => {
    if (
      "/" !== location.pathname ||
      location.pathname?.startsWith("/hot") ||
      location.pathname?.startsWith("/created") ||
      location.pathname?.startsWith("/trending")
    ) {
      history.push("/");
    }
    if (setStepOne) {
      return setStepOne();
    }
  };

  return (
    <div className="sticky-container" id="sticky-container">
      {floating && smVisible && <div className="nav-bar-rep" />}
      <div className={`nav-bar-toggle ${"position-fixed"}`} onClick={toggleSmVisible}>
        {smVisible ? closeSvg : menuSvg}
      </div>

      <div className={`nav-bar-sm ${"sticky"} ${step === 1 ? "transparent" : ""}`}>
        <div className="brand">
          {activeUser !== null ? (
            <Link to={logoHref}>
              <img src={logo} className="logo" alt="Logo" />
            </Link>
          ) : (
            <img src={logo} className="logo" alt="Logo" onClick={handleIconClick} />
          )}
        </div>

        {textMenu}
      </div>

      {!smVisible && (
        <div className={`nav-bar ${!transparentVerify && step === 1 ? "transparent" : ""} `}>
          <div className={`nav-bar-inner ${!transparentVerify && step === 1 ? "transparent" : ""}`}>
            <div className="brand">
              {activeUser !== null ? (
                <Link to={logoHref}>
                  <img src={logo} className="logo" alt="Logo" />
                </Link>
              ) : (
                <img src={logo} className="logo" alt="Logo" onClick={handleIconClick} />
              )}
            </div>
            {textMenu}
            <div className="flex-spacer" />
            {(step !== 1 || transparentVerify) && (
              <div className="search-bar">
                <Search history={history} />
              </div>
            )}
            <div className="switch-menu">
              <SwitchLang history={history} />
              {(step !== 1 || transparentVerify) && (
                <ToolTip content={themeText}>
                  <div className="switch-theme" onClick={changeTheme}>
                    {brightnessSvg}
                  </div>
                </ToolTip>
              )}
              {(step !== 1 || transparentVerify) && (
                <ToolTip content={_t("navbar.post")}>
                  <Link className="switch-theme pencil" to="/submit">
                    {pencilOutlineSvg}
                  </Link>
                </ToolTip>
              )}
            </div>
            <div className="btn-menu">
              {!activeUser && (
                <div>
                  <div className="login-required">
                    <Button
                      className="btn-login btn-primary"
                      onClick={() => {
                        toggleUIProp("login");
                        setSmVisible(false);
                      }}
                    >
                      {_t("g.login")}
                    </Button>

                    <Link className="btn btn-primary" to="/signup">
                      {_t("g.signup")}
                    </Link>
                  </div>
                  <div className="submit-post">
                    <ToolTip content={_t("navbar.post")}>
                      <Link className="btn btn-outline-primary" to="/submit">
                        {pencilOutlineSvg}
                      </Link>
                    </ToolTip>
                  </div>
                </div>
              )}
            </div>
            {activeUser && (
              <div>
                <UserNav history={history} />
                <div className="submit-post">
                  <ToolTip content={_t("navbar.post")}>
                    <Link className="btn btn-outline-primary" to="/submit">
                      {pencilOutlineSvg}
                    </Link>
                  </ToolTip>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div
        ref={navRef}
        className={_c(
          `nav-bar ${!transparentVerify && step === 1 ? "transparent" : ""} ${
            smVisible ? "visible-sm" : "d-none"
          }`
        )}
      >
        <div className="nav-bar-inner">
          <div className="mt-2 pt-5 w-100">
            {activeUser && (
              <Link to={`/@${activeUser.username}`}>
                <div className="p-1 menu-item menu-item-profile d-flex text-white text-15 align-items-center mt-0 mb-3 position-relative">
                  <UserAvatar username={activeUser.username} size="large" />
                  <div className="ml-2">
                    <b>@{activeUser.username}</b>
                    <div className="mt-1 text-white">
                      {_t("user-nav.vote-power")} <span>{upArrowSvg}</span>{" "}
                      {(activeUser.data as FullAccount).active &&
                        votingPower(activeUser.data as FullAccount).toFixed(0)}
                      % <span>{downArrowSvg}</span>{" "}
                      {(activeUser.data as FullAccount).active &&
                        downVotingPower(activeUser.data as FullAccount).toFixed(0)}
                      %
                    </div>
                  </div>
                </div>
              </Link>
            )}
            <div onClick={() => !showMobileSearch && setShowMobileSearch(true)}>
              <div className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark">
                {showMobileSearch ? (
                  <>
                    <Search containerClassName="w-100" history={history} />
                    <div
                      onClick={() => setShowMobileSearch(false)}
                      className="navbar-icon text-secondary ml-2"
                    >
                      {closeSvg}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="navbar-icon">{magnifySvg}</div>
                    <div className="ml-3 text-15">{_t("g.search")}</div>
                  </>
                )}
              </div>
            </div>

            {!activeUser && (
              <>
                <div
                  className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark"
                  onClick={() => {
                    toggleUIProp("login");
                    setSmVisible(false);
                  }}
                >
                  <div className="navbar-icon">{userOutlineSvg}</div>
                  <div className="ml-3 text-15">{_t("g.login")}</div>
                </div>
                <Link to="/signup" onClick={() => !showMobileSearch && setSmVisible(false)}>
                  <div className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark">
                    <div className="navbar-icon">{keySvg}</div>
                    <div className="ml-3 text-15">{_t("g.signup")}</div>
                  </div>
                </Link>
              </>
            )}

            <Link to="/submit" onClick={() => setSmVisible(false)}>
              <div className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark">
                <div className="navbar-icon">{pencilOutlinedSvg}</div>
                <div className="ml-3 text-15">{_t("g.submit")}</div>
              </div>
            </Link>

            <div>
              {activeUser && (
                <div
                  className="p-2 pl-3 w-100 mb-2 d-flex align-items-center text-dark"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="navbar-icon">{userOutlineSvg}</div>
                  <div className="ml-3 text-15">{_t("user-nav.profile-menu")}</div>
                  <div className="ml-3 text-15 icon-stroke">
                    {showProfileMenu ? upArrowSvg : downArrowSvg}
                  </div>
                </div>
              )}

              {activeUser && showProfileMenu ? (
                <div className="pl-3 position-relative menu-container">
                  <div className="menu-container-inner">
                    <div
                      className="p-1 menu-item"
                      onClick={() => {
                        setDrafts(!drafts);
                        setSmVisible(false);
                      }}
                    >
                      <div className="item-text">{_t("user-nav.drafts")}</div>
                    </div>

                    <div
                      className="p-1 menu-item"
                      onClick={() => {
                        setGallery(!gallery);
                        setSmVisible(false);
                      }}
                    >
                      <div className="item-text">{_t("user-nav.gallery")}</div>
                    </div>

                    <div
                      className="p-1 menu-item"
                      onClick={() => {
                        setBookmarks(!bookmarks);
                        setSmVisible(false);
                      }}
                    >
                      <div className="item-text">{_t("user-nav.bookmarks")}</div>
                    </div>

                    <div
                      className="p-1 menu-item"
                      onClick={() => {
                        setSchedules(!schedules);
                        setSmVisible(false);
                      }}
                    >
                      <div className="item-text">{_t("user-nav.schedules")}</div>
                    </div>

                    <div
                      className="p-1 menu-item"
                      onClick={() => {
                        setFragments(!fragments);
                        setSmVisible(false);
                      }}
                    >
                      <div className="item-text">{_t("user-nav.fragments")}</div>
                    </div>

                    <div className="p-1 menu-item">
                      <Link
                        to={`/@${activeUser.username}/settings`}
                        onClick={() => setSmVisible(false)}
                      >
                        <div className="item-text">{_t("user-nav.settings")}</div>
                      </Link>
                    </div>

                    <div
                      className="p-1 menu-item"
                      onClick={() => {
                        toggleUIProp("login");
                        setSmVisible(false);
                      }}
                    >
                      <div className="item-text">{_t("g.login-as")}</div>
                    </div>

                    <div className="p-1 menu-item" onClick={() => setActiveUser(null)}>
                      <div className="item-text">{_t("user-nav.logout")}</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {activeUser && (
              <>
                <div
                  className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark"
                  onClick={() => toggleUIProp("notifications")}
                >
                  <div className="navbar-icon text-dark">{notificationSvg}</div>
                  <div className="ml-3 text-15">{_t("user-nav.notifications")}</div>
                </div>
                <div
                  onClick={() => setShowPurchaseDialog(true)}
                  className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark"
                >
                  <div className="navbar-icon text-dark">{rocketSvg}</div>
                  <div className="ml-3 text-15">{_t("user-nav.boost")}</div>
                </div>
                <Link to={`/@${activeUser?.username}/wallet`} onClick={() => setSmVisible(false)}>
                  <div className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark">
                    <div className="icon-stroke text-dark">{walletSvg}</div>
                    <div className="ml-3 text-15 d-flex">
                      {_t("user-nav.wallet")} <div className="dot align-self-start ml-1" />
                    </div>
                  </div>
                </Link>
              </>
            )}

            <div className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark position-relative">
              <div className="navbar-icon">{globeSvg}</div>
              <div className="text-15 switch-menu">
                <SwitchLang label={_t("community-settings.lang")} history={history} />
              </div>
            </div>

            <div
              className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark"
              onClick={changeTheme}
            >
              <div className="navbar-icon">{global.theme == Theme.day ? moonSvg : sunSvg}</div>
              <div className="ml-3 text-15">
                {_t("user-nav.switch-to")}{" "}
                {global.theme == Theme.day ? _t("user-nav.dark") : _t("user-nav.light")}
              </div>
            </div>
          </div>
        </div>
        {ui.login && <Login history={history} />}
        {global.usePrivate && <NotificationHandler />}
        {gallery && <Gallery onHide={() => setGallery(!gallery)} />}
        {ui.notifications && activeUser && <UserNotifications history={history} />}
        {drafts && activeUser && <Drafts onHide={() => setDrafts(!drafts)} history={history} />}
        {bookmarks && activeUser && (
          <Bookmarks history={history} onHide={() => setBookmarks(!bookmarks)} />
        )}
        {schedules && activeUser && (
          <Schedules history={history} onHide={() => setSchedules(!schedules)} />
        )}
        {fragments && activeUser && <Fragments onHide={() => setFragments(!fragments)} />}
      </div>
      <PurchaseQrDialog
        show={showPurchaseDialog}
        setShow={(v) => setShowPurchaseDialog(v)}
        activeUser={activeUser}
        location={location}
      />
    </div>
  );
};
