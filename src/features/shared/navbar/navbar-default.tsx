import * as ls from "@/utils/local-storage";
import { classNameObject } from "@ui/util";
import Link from "next/link";
import { PurchaseQrDialog, SwitchLang, UserAvatar } from "@/features/shared";
import i18next from "i18next";
import {
  closeSvg,
  downArrowSvg,
  globeSvg,
  keySvg,
  magnifyResponsibleSvg,
  moonSvg,
  notificationSvg,
  pencilOutlineSvg,
  rocketSvg,
  sunSvg,
  upArrowSvg,
  userOutlineSvg,
  walletSvg
} from "@ui/svg";
import { FullAccount } from "@/entities";
import { downVotingPower, votingPower } from "@/api/hive";
import { Theme } from "@/enums";
import { useState } from "react";
import { useGlobalStore } from "@/core/global-store";
import { Search } from "./search";
import { FragmentsDialog } from "@/features/shared/fragments";
import { SchedulesDialog } from "@/features/shared/schedules";
import { BookmarksDialog } from "@/features/shared/bookmarks";
import { GalleryDialog } from "@/features/shared/gallery";

interface Props {
  history: History;
  setSmVisible: (v: boolean) => void;
}

export function NavbarDefault({ setSmVisible, history }: Props) {
  const toggleTheme = useGlobalStore((state) => state.toggleTheme);
  const activeUser = useGlobalStore((state) => state.activeUser);
  const setActiveUser = useGlobalStore((state) => state.setActiveUser);
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);
  const theme = useGlobalStore((state) => state.theme);

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
            <Link href={`/@${activeUser.username}`}>
              <div className="p-1 ml-6 rounded-tl-full rounded-bl-full bg-blue-dark-sky flex text-white text-15 items-center mt-0 mb-3 relative">
                <UserAvatar username={activeUser.username} size="large" />
                <div className="ml-2">
                  <b>@{activeUser.username}</b>
                  <div className="mt-1 text-white">
                    {i18next.t("user-nav.vote-power")} <span>{upArrowSvg}</span>{" "}
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
            <div className="p-2 pl-3 w-full mb-2 flex items-center text-dark-default dark:text-white">
              {showMobileSearch ? (
                <>
                  <Search containerClassName="w-full" />
                  <div
                    onClick={() => setShowMobileSearch(false)}
                    className="w-6 h-6 flex text-gray-600 ml-2"
                  >
                    {closeSvg}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 flex">{magnifyResponsibleSvg}</div>
                  <div className="ml-3 leading-1">{i18next.t("g.search")}</div>
                </>
              )}
            </div>
          </div>

          {!activeUser && (
            <>
              <div
                className="p-2 pl-3 w-full mb-2 flex items-center text-dark-default dark:text-white"
                onClick={() => {
                  toggleUIProp("login");
                  setSmVisible(false);
                }}
              >
                <div className="flex">{userOutlineSvg}</div>
                <div className="ml-3 text-15">{i18next.t("g.login")}</div>
              </div>
              <Link href="/signup" onClick={() => !showMobileSearch && setSmVisible(false)}>
                <div className="p-2 pl-3 w-full mb-2 flex items-center text-dark-default dark:text-white">
                  <div className="flex">{keySvg}</div>
                  <div className="ml-3 text-15">{i18next.t("g.signup")}</div>
                </div>
              </Link>
            </>
          )}

          <div>
            {activeUser && (
              <div
                className="p-2 pl-3 w-full mb-2 flex items-center text-dark-default dark:text-white"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="flex">{userOutlineSvg}</div>
                <div className="ml-3 text-15">{i18next.t("user-nav.profile-menu")}</div>
                <div className="ml-3 text-15 flex">
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
                    {i18next.t("user-nav.drafts")}
                  </div>

                  <div
                    className="my-4 pl-8"
                    onClick={() => {
                      setGallery(!gallery);
                      setSmVisible(false);
                    }}
                  >
                    {i18next.t("user-nav.gallery")}
                  </div>

                  <div
                    className="my-4 pl-8"
                    onClick={() => {
                      setBookmarks(!bookmarks);
                      setSmVisible(false);
                    }}
                  >
                    {i18next.t("user-nav.bookmarks")}
                  </div>

                  <div
                    className="my-4 pl-8"
                    onClick={() => {
                      setSchedules(!schedules);
                      setSmVisible(false);
                    }}
                  >
                    {i18next.t("user-nav.schedules")}
                  </div>

                  <div
                    className="my-4 pl-8"
                    onClick={() => {
                      setFragments(!fragments);
                      setSmVisible(false);
                    }}
                  >
                    {i18next.t("user-nav.fragments")}
                  </div>

                  <div className="my-4 pl-8">
                    <Link
                      href={`/@${activeUser.username}/settings`}
                      onClick={() => setSmVisible(false)}
                    >
                      {i18next.t("user-nav.settings")}
                    </Link>
                  </div>

                  <div
                    className="my-4 pl-8"
                    onClick={() => {
                      toggleUIProp("login");
                      setSmVisible(false);
                    }}
                  >
                    {i18next.t("g.login-as")}
                  </div>

                  <div className="my-4 pl-8" onClick={() => setActiveUser(null)}>
                    {i18next.t("user-nav.logout")}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {activeUser && (
            <>
              <div
                className="p-2 pl-3 w-full mb-2 flex items-center text-dark-default dark:text-white"
                onClick={() => toggleUIProp("notifications")}
              >
                <div className="flex text-dark-default dark:text-white">{notificationSvg}</div>
                <div className="ml-3 text-15">{i18next.t("user-nav.notifications")}</div>
              </div>
              <div
                onClick={() => setShowPurchaseDialog(true)}
                className="p-2 pl-3 w-full mb-2 flex items-center text-dark-default dark:text-white"
              >
                <div className="flex text-dark-default dark:text-white">{rocketSvg}</div>
                <div className="ml-3 text-15">{i18next.t("user-nav.boost")}</div>
              </div>
              <Link
                className="text-dark-default dark:text-white"
                href={`/@${activeUser?.username}/wallet`}
                onClick={() => setSmVisible(false)}
              >
                <div className="p-2 pl-3 w-full mb-2 flex items-center text-dark-default dark:text-white">
                  <div className="flex text-dark-default dark:text-white">{walletSvg}</div>
                  <div className="ml-3 text-15 flex">
                    {i18next.t("user-nav.wallet")}
                    <div className="dot align-self-start ml-1" />
                  </div>
                </div>
              </Link>
              <Link
                className="text-dark-default dark:text-white"
                href="/submit"
                onClick={() => setSmVisible(false)}
              >
                <div className="p-2 pl-3 w-full mb-2 flex items-center text-dark-default dark:text-white">
                  <div className="flex text-dark-default dark:text-white [&>svg]:w-[20px]">
                    {pencilOutlineSvg}
                  </div>
                  <div className="ml-3 text-15 flex">
                    {i18next.t("user-nav.submit")}
                    <div className="dot align-self-start ml-1" />
                  </div>
                </div>
              </Link>
            </>
          )}

          <div className="p-2 pl-3 w-full mb-2 flex items-center text-dark-default dark:text-white relative">
            <div className="flex">{globeSvg}</div>
            <SwitchLang label={i18next.t("community-settings.lang")} />
          </div>

          <div
            className="p-2 pl-3 w-full mb-2 flex items-center text-dark-default dark:text-white"
            onClick={changeTheme}
          >
            <div className="flex">{theme == Theme.day ? moonSvg : sunSvg}</div>
            <div className="ml-3 text-15">
              {i18next.t("user-nav.switch-to")}{" "}
              {theme == Theme.day ? i18next.t("user-nav.dark") : i18next.t("user-nav.light")}
            </div>
          </div>
        </div>
      </div>
      {gallery && <GalleryDialog onHide={() => setGallery(!gallery)} />}
      {/*{ui.notifications && activeUser && <UserNotifications history={history} />}*/}
      {/*{drafts && activeUser && <Drafts onHide={() => setDrafts(!drafts)} history={history} />}*/}
      {bookmarks && activeUser && <BookmarksDialog onHide={() => setBookmarks(!bookmarks)} />}
      {schedules && activeUser && <SchedulesDialog onHide={() => setSchedules(!schedules)} />}
      {fragments && activeUser && <FragmentsDialog onHide={() => setFragments(!fragments)} />}
      <PurchaseQrDialog show={showPurchaseDialog} setShow={(v) => setShowPurchaseDialog(v)} />
    </>
  );
}
