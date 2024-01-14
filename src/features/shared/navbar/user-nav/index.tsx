import React, { ReactElement, useState } from "react";
import "./_index.scss";
import { WalletBadge } from "./wallet-badge";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { PurchaseQrDialog, UserAvatar } from "@/features/shared";
import { bellOffSvg, bellSvg, chevronUpSvg, rocketSvg } from "@ui/svg";
import { downVotingPower, votingPower } from "@/api/hive";
import { Tooltip } from "@/features/ui";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { FragmentsDialog } from "@/features/shared/fragments";
import { SchedulesDialog } from "@/features/shared/schedules";
import { BookmarksDialog } from "@/features/shared/bookmarks";
import { GalleryDialog } from "@/features/shared/gallery";
import { DraftsDialog } from "@/features/shared/drafts";
import { NotificationsDialog } from "@/features/shared/notifications";
import { useNotificationUnreadCountQuery } from "@/api/queries";

export * from "./wallet-badge";

interface Props {
  icon?: ReactElement;
}

export const UserNav = ({ icon }: Props) => {
  const router = useRouter();

  const activeUser = useGlobalStore((state) => state.activeUser);
  const setActiveUser = useGlobalStore((state) => state.setActiveUser);
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);
  const usePrivate = useGlobalStore((state) => state.usePrivate);
  const globalNotifications = useGlobalStore((state) => state.globalNotifications);
  const showNotifications = useGlobalStore((state) => state.uiNotifications);

  const [gallery, setGallery] = useState(false);
  const [drafts, setDrafts] = useState(false);
  const [bookmarks, setBookmarks] = useState(false);
  const [schedules, setSchedules] = useState(false);
  const [fragments, setFragments] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const { data: notificationsUnread } = useNotificationUnreadCountQuery();

  const dropDownItems = [
    {
      label: i18next.t("user-nav.profile"),
      href: `/@${activeUser?.username}`
    },
    ...(usePrivate
      ? [
          {
            label: i18next.t("user-nav.drafts"),
            onClick: () => setDrafts(!drafts)
          },
          {
            label: i18next.t("user-nav.gallery"),
            onClick: () => setGallery(!gallery)
          },
          {
            label: i18next.t("user-nav.bookmarks"),
            onClick: () => setBookmarks(!bookmarks)
          },
          {
            label: i18next.t("user-nav.schedules"),
            onClick: () => setSchedules(!schedules)
          },
          {
            label: i18next.t("user-nav.fragments"),
            onClick: () => setFragments(!fragments)
          }
        ]
      : []),
    {
      label: i18next.t("user-nav.settings"),
      onClick: () => router.push(`/@${activeUser?.username}/settings`)
    },
    {
      label: i18next.t("g.login-as"),
      onClick: () => toggleUIProp("login")
    },
    {
      label: i18next.t("user-nav.logout"),
      onClick: () => {
        setActiveUser(null);
      }
    }
  ];

  return (
    <>
      <div className="user-nav">
        {usePrivate && (
          <div onClick={() => setShowPurchaseDialog(true)} className="user-points cursor-pointer">
            {rocketSvg}
          </div>
        )}
        <WalletBadge icon={icon} />

        {usePrivate ? (
          <Tooltip content={i18next.t("user-nav.notifications")}>
            <span className="notifications" onClick={() => toggleUIProp("notifications")}>
              {notificationsUnread > 0 && (
                <span className="notifications-badge notranslate">
                  {notificationsUnread.toString().length < 3 ? notificationsUnread : "..."}
                </span>
              )}
              {globalNotifications ? bellSvg : bellOffSvg}
            </span>
          </Tooltip>
        ) : (
          <></>
        )}

        <Dropdown>
          <DropdownToggle>
            <UserAvatar username={activeUser?.username ?? ""} size="medium" />
          </DropdownToggle>
          <DropdownMenu align="right">
            {/*TODO: ADD HEADER WITH USERNAME*/}
            {activeUser?.data.__loaded && (
              <div className="drop-down-menu-power">
                <div className="label">{i18next.t("user-nav.vote-power")}</div>
                <div className="power">
                  <div className="voting">
                    {chevronUpSvg}
                    {votingPower(activeUser.data).toFixed(0)}
                    {"%"}
                  </div>
                  <div className="downVoting">
                    {chevronUpSvg}
                    {downVotingPower(activeUser.data).toFixed(0)}
                    {"%"}
                  </div>
                </div>
              </div>
            )}
            {dropDownItems.map((item) => (
              <DropdownItem
                key={item.label}
                onClick={() => {
                  item.onClick?.();
                  if (item.href) {
                    router.push(item.href);
                  }
                }}
              >
                {item.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
      {showNotifications && activeUser && (
        <NotificationsDialog onHide={() => toggleUIProp("notifications")} />
      )}
      {gallery && <GalleryDialog onHide={() => setGallery(false)} />}
      {drafts && <DraftsDialog onHide={() => setDrafts(false)} />}
      {bookmarks && <BookmarksDialog onHide={() => setBookmarks(false)} />}
      {schedules && <SchedulesDialog onHide={() => setSchedules(false)} />}
      {fragments && <FragmentsDialog onHide={() => setFragments(false)} />}
      <PurchaseQrDialog show={showPurchaseDialog} setShow={setShowPurchaseDialog} />
    </>
  );
};
