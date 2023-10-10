import { Link } from "react-router-dom";
import { _t } from "../../i18n";
import {
  closeSvg,
  downArrowSvg,
  globeSvg,
  keySvg,
  magnifyResponsibleSvg,
  moonSvg,
  notificationSvg,
  rocketSvg,
  sunSvg,
  upArrowSvg,
  userOutlineSvg,
  walletSvg
} from "../../img/svg";
import { FullAccount } from "../../store/accounts/types";
import { downVotingPower, votingPower } from "../../api/hive";
import { Theme } from "../../store/global/types";
import React, { useState } from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import UserAvatar from "../user-avatar";
import Search from "../search";
import { History } from "history";
import SwitchLang from "../switch-lang";
import * as ls from "../../util/local-storage";
import NotificationHandler from "../notification-handler";
import UserNotifications from "../notifications";
import { PurchaseQrDialog } from "../purchase-qr";
import Gallery from "../gallery";
import Drafts from "../drafts";
import Bookmarks from "../bookmarks";
import Schedules from "../schedules";
import Fragments from "../fragments";
import { useLocation } from "react-router";
import { classNameObject } from "../../helper/class-name-object";

interface Props {
  history: History;
  setSmVisible: (v: boolean) => void;
}

export function NavbarDefault({ setSmVisible, history }: Props) {
  const { activeUser, toggleTheme, toggleUIProp, setActiveUser, global, ui } = useMappedStore();

  const location = useLocation();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [drafts, setDrafts] = useState(false);
  const [bookmarks, setBookmarks] = useState(false);
  const [schedules, setSchedules] = useState(false);
  const [fragments, setFragments] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const changeTheme = () => {
    ls.remove("use_system_theme");
    toggleTheme();
  };

  return (
    <>
      <div
        className={classNameObject({
          "navbar-default fixed top-[64px] left-0 w-full bg-light-200 dark:bg-dark-200 items-center justify-between flex-col":
            true,
          "h-[100vh] overflow-y-auto overflow-x-hidden": true
        })}
      >
        <div className="mt-2 pt-5 w-full">
          {activeUser && (
            <Link to={`/@${activeUser.username}`}>
              <div className="p-1 ml-6 rounded-tl-full rounded-bl-full bg-blue-dark-sky flex text-white text-15 items-center mt-0 mb-3 relative">
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
            <div className="p-2 pl-3 w-full mb-2 flex items-center text-dark">
              {showMobileSearch ? (
                <>
                  <Search containerClassName="w-full" history={history} />
                  <div
                    onClick={() => setShowMobileSearch(false)}
                    className="w-6 h-6 text-secondary ml-2"
                  >
                    {closeSvg}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-6 h-6">{magnifyResponsibleSvg}</div>
                  <div className="ml-3 text-15">{_t("g.search")}</div>
                </>
              )}
            </div>
          </div>

          {!activeUser && (
            <>
              <div
                className="p-2 pl-3 w-full mb-2 flex items-center text-dark"
                onClick={() => {
                  toggleUIProp("login");
                  setSmVisible(false);
                }}
              >
                <div className="navbar-icon">{userOutlineSvg}</div>
                <div className="ml-3 text-15">{_t("g.login")}</div>
              </div>
              <Link to="/signup" onClick={() => !showMobileSearch && setSmVisible(false)}>
                <div className="p-2 pl-3 w-full mb-2 flex items-center text-dark">
                  <div className="navbar-icon">{keySvg}</div>
                  <div className="ml-3 text-15">{_t("g.signup")}</div>
                </div>
              </Link>
            </>
          )}

          <div>
            {activeUser && (
              <div
                className="p-2 pl-3 w-full mb-2 flex items-center text-dark"
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
              <div className="pl-3 relative menu-container">
                <div className="menu-container-inner">
                  <div
                    className="my-4 pl-8"
                    onClick={() => {
                      setDrafts(!drafts);
                      setSmVisible(false);
                    }}
                  >
                    {_t("user-nav.drafts")}
                  </div>

                  <div
                    className="my-4 pl-8"
                    onClick={() => {
                      setGallery(!gallery);
                      setSmVisible(false);
                    }}
                  >
                    {_t("user-nav.gallery")}
                  </div>

                  <div
                    className="my-4 pl-8"
                    onClick={() => {
                      setBookmarks(!bookmarks);
                      setSmVisible(false);
                    }}
                  >
                    {_t("user-nav.bookmarks")}
                  </div>

                  <div
                    className="my-4 pl-8"
                    onClick={() => {
                      setSchedules(!schedules);
                      setSmVisible(false);
                    }}
                  >
                    {_t("user-nav.schedules")}
                  </div>

                  <div
                    className="my-4 pl-8"
                    onClick={() => {
                      setFragments(!fragments);
                      setSmVisible(false);
                    }}
                  >
                    {_t("user-nav.fragments")}
                  </div>

                  <div className="my-4 pl-8">
                    <Link
                      to={`/@${activeUser.username}/settings`}
                      onClick={() => setSmVisible(false)}
                    >
                      {_t("user-nav.settings")}
                    </Link>
                  </div>

                  <div
                    className="my-4 pl-8"
                    onClick={() => {
                      toggleUIProp("login");
                      setSmVisible(false);
                    }}
                  >
                    {_t("g.login-as")}
                  </div>

                  <div className="my-4 pl-8" onClick={() => setActiveUser(null)}>
                    {_t("user-nav.logout")}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {activeUser && (
            <>
              <div
                className="p-2 pl-3 w-full mb-2 flex items-center text-dark"
                onClick={() => toggleUIProp("notifications")}
              >
                <div className="navbar-icon text-dark">{notificationSvg}</div>
                <div className="ml-3 text-15">{_t("user-nav.notifications")}</div>
              </div>
              <div
                onClick={() => setShowPurchaseDialog(true)}
                className="p-2 pl-3 w-full mb-2 flex items-center text-dark"
              >
                <div className="navbar-icon text-dark">{rocketSvg}</div>
                <div className="ml-3 text-15">{_t("user-nav.boost")}</div>
              </div>
              <Link to={`/@${activeUser?.username}/wallet`} onClick={() => setSmVisible(false)}>
                <div className="p-2 pl-3 w-full mb-2 flex items-center text-dark">
                  <div className="icon-stroke text-dark">{walletSvg}</div>
                  <div className="ml-3 text-15 flex">
                    {_t("user-nav.wallet")} <div className="dot align-self-start ml-1" />
                  </div>
                </div>
              </Link>
            </>
          )}

          <div className="p-2 pl-3 w-full mb-2 flex items-center text-dark relative">
            <div className="navbar-icon">{globeSvg}</div>
            <SwitchLang label={_t("community-settings.lang")} history={history} />
          </div>

          <div className="p-2 pl-3 w-full mb-2 flex items-center text-dark" onClick={changeTheme}>
            <div className="navbar-icon">{global.theme == Theme.day ? moonSvg : sunSvg}</div>
            <div className="ml-3 text-15">
              {_t("user-nav.switch-to")}{" "}
              {global.theme == Theme.day ? _t("user-nav.dark") : _t("user-nav.light")}
            </div>
          </div>
        </div>
      </div>
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
      <PurchaseQrDialog
        show={showPurchaseDialog}
        setShow={(v) => setShowPurchaseDialog(v)}
        activeUser={activeUser}
        location={location}
      />
    </>
  );
}
