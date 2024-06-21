import React, { useState } from "react";
import "../_deck-toolbar.scss";
import { DeckToolbarUser } from "./deck-toolbar-user";
import { DeckToolbarBaseActions } from "./deck-toolbar-base-actions";
import { DeckToolbarToggleArea } from "./deck-toolbar-toggle-area";
import { DeckToolbarManager } from "./deck-toolbar-manager";
import { DeckToolbarCreate } from "./deck-toolbar-create";
import { useGlobalStore } from "@/core/global-store";
import { LoginDialog, NotificationHandler, PurchaseQrDialog } from "@/features/shared";
import { FragmentsDialog } from "@/features/shared/fragments";
import { SchedulesDialog } from "@/features/shared/schedules";
import { BookmarksDialog } from "@/features/shared/bookmarks";
import { DraftsDialog } from "@/features/shared/drafts";
import { GalleryDialog } from "@/features/shared/gallery";
import { NotificationsDialog } from "@/features/shared/notifications";
import { useRouter } from "next/navigation";
import i18next from "i18next";

interface Props {
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  history: History;
}

export const DeckToolbar = ({ isExpanded, setIsExpanded, history }: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const setActiveUser = useGlobalStore((s) => s.setActiveUser);
  const toggleUIProp = useGlobalStore((s) => s.toggleUiProp);
  const uiNotifications = useGlobalStore((s) => s.uiNotifications);
  const usePrivate = useGlobalStore((s) => s.usePrivate);
  const uiLogin = useGlobalStore((s) => s.login);

  const router = useRouter();

  const [gallery, setGallery] = useState(false);
  const [drafts, setDrafts] = useState(false);
  const [bookmarks, setBookmarks] = useState(false);
  const [schedules, setSchedules] = useState(false);
  const [fragments, setFragments] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const authorizedItems = [
    {
      label: i18next.t("user-nav.profile"),
      onClick: () => router.push(`/@${activeUser?.username}`)
    },
    ...(usePrivate
      ? [
          {
            label: i18next.t("user-nav.drafts"),
            onClick: () => setDrafts(true)
          },
          {
            label: i18next.t("user-nav.gallery"),
            onClick: () => setGallery(true)
          },
          {
            label: i18next.t("user-nav.bookmarks"),
            onClick: () => setBookmarks(true)
          },
          {
            label: i18next.t("user-nav.schedules"),
            onClick: () => setSchedules(true)
          },
          {
            label: i18next.t("user-nav.fragments"),
            onClick: () => setFragments(true)
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
      <GalleryDialog show={gallery} setShow={setGallery} />
      <DraftsDialog show={drafts} setShow={setDrafts} />
      <BookmarksDialog show={bookmarks} setShow={setBookmarks} />
      <SchedulesDialog show={schedules} setShow={setSchedules} />
      <FragmentsDialog show={fragments} setShow={setFragments} />
      {usePrivate && <NotificationHandler />}
      {uiNotifications && activeUser && <NotificationsDialog openLinksInNewTab={true} />}
      {uiLogin && <LoginDialog />}
      <PurchaseQrDialog show={showPurchaseDialog} setShow={(v) => setShowPurchaseDialog(v)} />
    </div>
  );
};
