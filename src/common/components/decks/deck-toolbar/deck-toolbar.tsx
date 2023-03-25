import React, { useState } from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { UserAvatar } from "../../user-avatar";
import "../_deck-toolbar.scss";
import { arrowLeftSvg, arrowRightSvg, bellOffSvg, bellSvg } from "../../../img/svg";
import { FullAccount } from "../../../store/accounts/types";
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

interface Props {
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  history: History;
}

export const DeckToolbar = ({ isExpanded, setIsExpanded, history }: Props) => {
  const { activeUser, global, toggleUIProp, setActiveUser } = useMappedStore();
  const location = useLocation();

  const [gallery, setGallery] = useState(false);
  const [drafts, setDrafts] = useState(false);
  const [bookmarks, setBookmarks] = useState(false);
  const [schedules, setSchedules] = useState(false);
  const [fragments, setFragments] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const dropDownItems = [
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
        <DeckToolbarUser items={dropDownItems} isExpanded={isExpanded} />
        <DeckToolbarBaseActions setShowPurchaseDialog={setShowPurchaseDialog} />
      </div>
      <div className="deck-toolbar-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? arrowLeftSvg : arrowRightSvg}
      </div>
      {gallery && <Gallery onHide={() => setGallery(false)} />}
      {drafts && <Drafts history={history} onHide={() => setDrafts(false)} />}
      {bookmarks && <Bookmarks history={history} onHide={() => setBookmarks(false)} />}
      {schedules && <Schedules history={history} onHide={() => setSchedules(false)} />}
      {fragments && <Fragments onHide={() => setFragments(false)} />}
      <PurchaseQrDialog
        show={showPurchaseDialog}
        setShow={(v) => setShowPurchaseDialog(v)}
        activeUser={activeUser}
        location={location}
      />
    </div>
  );
};
