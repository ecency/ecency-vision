import React, { useState } from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import "../_deck-toolbar.scss";
import { History } from "history";
import { _t } from "../../../i18n";
import { PurchaseQrDialog } from "../../purchase-qr";
import Gallery from "../../gallery";
import Drafts from "../../drafts";
import Bookmarks from "../../bookmarks";
import Schedules from "../../schedules";
import Fragments from "../../fragments";
import { useLocation } from "react-router";
import { DeckToolbarUser } from "./deck-toolbar-user";
import { DeckToolbarBaseActions } from "./deck-toolbar-base-actions";
import { DeckToolbarToggleArea } from "./deck-toolbar-toggle-area";
import { DeckToolbarManager } from "./deck-toolbar-manager";
import { DeckToolbarCreate } from "./deck-toolbar-create";
import UserNotifications from "../../notifications";
import NotificationHandler from "../../notification-handler";
import Login from "../../login";

interface Props {
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  history: History;
}

export const DeckToolbar = ({ isExpanded, setIsExpanded, history }: Props) => {
  const { activeUser, global, toggleUIProp, setActiveUser, ui } = useMappedStore();
  const location = useLocation();

  const [gallery, setGallery] = useState(false);
  const [drafts, setDrafts] = useState(false);
  const [bookmarks, setBookmarks] = useState(false);
  const [schedules, setSchedules] = useState(false);
  const [fragments, setFragments] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const authorizedItems = [
    {
      label: _t("user-nav.profile"),
      onClick: () => history.push(`/@${activeUser?.username}`)
    },
    ...(global.usePrivate
      ? [
          {
            label: _t("user-nav.drafts"),
            onClick: () => setDrafts(true)
          },
          {
            label: _t("user-nav.gallery"),
            onClick: () => setGallery(true)
          },
          {
            label: _t("user-nav.bookmarks"),
            onClick: () => setBookmarks(true)
          },
          {
            label: _t("user-nav.schedules"),
            onClick: () => setSchedules(true)
          },
          {
            label: _t("user-nav.fragments"),
            onClick: () => setFragments(true)
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
      onClick: () => setActiveUser(null)
    }
  ];

  return (
    <div className={"deck-toolbar " + (isExpanded ? "expanded" : "")}>
      <div className="deck-toolbar-content">
        <DeckToolbarUser
          history={history}
          items={authorizedItems}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
        <DeckToolbarBaseActions
          isExpanded={isExpanded}
          history={history}
          setIsExpanded={setIsExpanded}
          setShowPurchaseDialog={setShowPurchaseDialog}
        />
        <DeckToolbarCreate isExpanded={isExpanded} />
        <DeckToolbarManager isExpanded={isExpanded} />
      </div>
      <DeckToolbarToggleArea isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      {gallery && <Gallery onHide={() => setGallery(false)} />}
      {drafts && <Drafts history={history} onHide={() => setDrafts(false)} />}
      {bookmarks && <Bookmarks history={history} onHide={() => setBookmarks(false)} />}
      {schedules && <Schedules history={history} onHide={() => setSchedules(false)} />}
      {fragments && <Fragments onHide={() => setFragments(false)} />}
      {global.usePrivate && <NotificationHandler />}
      {ui.notifications && activeUser && (
        <UserNotifications history={history} openLinksInNewTab={true} />
      )}
      {ui.login && <Login history={history} />}
      <PurchaseQrDialog
        show={showPurchaseDialog}
        setShow={(v) => setShowPurchaseDialog(v)}
        activeUser={activeUser}
        location={location}
      />
    </div>
  );
};
