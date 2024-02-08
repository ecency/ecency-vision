import React, { useState } from "react";
import { _t } from "../../i18n";
import { useMappedStore } from "../../store/use-mapped-store";
import { useLocation } from "react-router";
import "./_index.scss";
import { bellOffSvg, bellSvg, chevronUpSvg, rocketSvg } from "../../img/svg";
import { downVotingPower, votingPower } from "../../api/hive";
import { WalletBadge } from "./wallet-badge";
import ToolTip from "../tooltip";
import DropDown from "../dropdown";
import UserNotifications from "../notifications";
import { PurchaseQrDialog } from "../purchase-qr";
import { History } from "history";
import UserAvatar from "../user-avatar";
import Gallery from "../gallery";
import Drafts from "../drafts";
import Bookmarks from "../bookmarks";
import Schedules from "../schedules";
import Fragments from "../fragments";

export * from "./wallet-badge";

interface Props {
  history: History;
  icon?: JSX.Element;
}

export const UserNav = ({ history, icon }: Props) => {
  const location = useLocation();
  const { global, ui, activeUser, notifications, setActiveUser, toggleUIProp } = useMappedStore();

  const [gallery, setGallery] = useState(false);
  const [drafts, setDrafts] = useState(false);
  const [bookmarks, setBookmarks] = useState(false);
  const [schedules, setSchedules] = useState(false);
  const [fragments, setFragments] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const dropDownItems = [
    {
      label: _t("user-nav.profile"),
      href: `/@${activeUser?.username}`
    },
    ...(global.usePrivate
      ? [
          {
            label: _t("user-nav.drafts"),
            onClick: () => setDrafts(!drafts)
          },
          {
            label: _t("user-nav.gallery"),
            onClick: () => setGallery(!gallery)
          },
          {
            label: _t("user-nav.bookmarks"),
            onClick: () => setBookmarks(!bookmarks)
          },
          {
            label: _t("user-nav.schedules"),
            onClick: () => setSchedules(!schedules)
          },
          {
            label: _t("user-nav.fragments"),
            onClick: () => setFragments(!fragments)
          }
        ]
      : []),
    {
      label: _t("user-nav.settings"),
      onClick: () => history.push(`/@${activeUser?.username}/settings`)
    },
    {
      label: _t("g.login-as"),
      onClick: () => toggleUIProp("login")
    },
    {
      label: _t("user-nav.logout"),
      onClick: () => {
        setActiveUser(null);
      }
    }
  ];

  const dropDownConfig = {
    history: history,
    label: <UserAvatar username={activeUser?.username ?? ""} size="medium" />,
    items: dropDownItems,
    preElem: activeUser?.data.__loaded ? (
      <div className="drop-down-menu-power">
        <div className="label">{_t("user-nav.vote-power")}</div>
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
    ) : undefined
  };

  return (
    <>
      <div className="user-nav">
        {global.usePrivate && (
          <div onClick={() => setShowPurchaseDialog(true)} className="user-points cursor-pointer">
            {rocketSvg}
          </div>
        )}
        <WalletBadge icon={icon} />

        {global.usePrivate ? (
          <>
            <ToolTip content={_t("user-nav.notifications")}>
              <span className="notifications" onClick={() => toggleUIProp("notifications")}>
                {notifications.unread > 0 && (
                  <span className="notifications-badge notranslate">
                    {notifications.unread.toString().length < 3 ? notifications.unread : "..."}
                  </span>
                )}
                {global.notifications ? bellSvg : bellOffSvg}
              </span>
            </ToolTip>
          </>
        ) : (
          <></>
        )}

        <DropDown {...dropDownConfig} float="right" header={`@${activeUser?.username}`} />
      </div>
      {ui.notifications && <UserNotifications history={history} />}
      {gallery && <Gallery onHide={() => setGallery(false)} />}
      {drafts && <Drafts history={history} onHide={() => setDrafts(false)} />}
      {bookmarks && <Bookmarks history={history} onHide={() => setBookmarks(false)} />}
      {schedules && <Schedules history={history} onHide={() => setSchedules(false)} />}
      {fragments && <Fragments onHide={() => setFragments(false)} />}
      <PurchaseQrDialog
        show={showPurchaseDialog}
        setShow={setShowPurchaseDialog}
        activeUser={activeUser}
        location={location}
      />
    </>
  );
};
