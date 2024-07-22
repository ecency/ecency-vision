import React, { useMemo, useState } from "react";
import {
  UilArchive,
  UilClock,
  UilDashboard,
  UilDocumentInfo,
  UilFavorite,
  UilImages,
  UilMoneyWithdraw,
  UilSetting,
  UilSignin,
  UilSignout,
  UilUser,
  UilWallet
} from "@iconscout/react-unicons";
import { NavbarSideMainMenuItem } from "./navbar-side-main-menu-item";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { GalleryDialog } from "@/features/shared/gallery";
import { DraftsDialog } from "@/features/shared/drafts";
import { BookmarksDialog } from "@/features/shared/bookmarks";
import { SchedulesDialog } from "@/features/shared/schedules";
import { FragmentsDialog } from "@/features/shared/fragments";

interface Props {
  onHide: () => void;
}

export function NavbarSideMainMenu({ onHide }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const usePrivate = useGlobalStore((state) => state.usePrivate);
  const setActiveUser = useGlobalStore((state) => state.setActiveUser);
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);

  const [gallery, setGallery] = useState(false);
  const [drafts, setDrafts] = useState(false);
  const [bookmarks, setBookmarks] = useState(false);
  const [schedules, setSchedules] = useState(false);
  const [fragments, setFragments] = useState(false);

  const mainMenu = useMemo(
    () => [
      {
        label: i18next.t("user-nav.profile"),
        to: `/@${activeUser?.username}`,
        icon: <UilUser size={16} />,
        onClick: () => onHide()
      },
      {
        label: i18next.t("user-nav.wallet"),
        to: `/@${activeUser?.username}/wallet`,
        icon: <UilWallet size={16} />,
        onClick: () => onHide()
      },
      ...(usePrivate
        ? [
            {
              label: i18next.t("user-nav.drafts"),
              onClick: () => setDrafts(!drafts),
              icon: <UilDocumentInfo size={16} />
            },
            {
              label: i18next.t("user-nav.gallery"),
              onClick: () => setGallery(!gallery),
              icon: <UilImages size={16} />
            },
            {
              label: i18next.t("user-nav.bookmarks"),
              onClick: () => setBookmarks(!bookmarks),
              icon: <UilFavorite size={16} />
            },
            {
              label: i18next.t("user-nav.schedules"),
              onClick: () => setSchedules(!schedules),
              icon: <UilClock size={16} />
            },
            {
              label: i18next.t("user-nav.fragments"),
              onClick: () => setFragments(!fragments),
              icon: <UilArchive size={16} />
            }
          ]
        : []),
      {
        label: i18next.t("user-nav.settings"),
        to: `/@${activeUser?.username}/settings`,
        onClick: () => onHide(),
        icon: <UilSetting size={16} />
      }
    ],
    [activeUser?.username, bookmarks, drafts, fragments, gallery, onHide, schedules, usePrivate]
  );

  const authMenu = useMemo(
    () => [
      {
        label: i18next.t("g.login-as"),
        onClick: () => toggleUIProp("login"),
        icon: <UilSignin size={16} />
      },
      {
        label: i18next.t("user-nav.logout"),
        icon: <UilSignout size={16} />,
        onClick: () => {
          setActiveUser(null);
        }
      }
    ],
    [setActiveUser, toggleUIProp]
  );

  return (
    <>
      <div className="px-4 flex flex-col gap-0.5">
        {mainMenu.map(({ label, onClick, icon, to }) => (
          <NavbarSideMainMenuItem to={to} key={label} label={label} onClick={onClick} icon={icon} />
        ))}
        <hr className="my-2" />
        <NavbarSideMainMenuItem
          label={i18next.t("market.swap-title")}
          to="/market#swap"
          onClick={onHide}
          icon={<UilMoneyWithdraw size={16} />}
        />
        <NavbarSideMainMenuItem
          label={i18next.t("market.advanced-title")}
          to="/market#advanced"
          onClick={onHide}
          icon={<UilDashboard size={16} />}
        />
        <hr className="my-2" />
        {authMenu.map(({ label, onClick, icon }) => (
          <NavbarSideMainMenuItem
            key={label}
            label={label}
            onClick={() => {
              onClick?.();
              onHide();
            }}
            icon={icon}
          />
        ))}
      </div>
      <GalleryDialog setShow={(v) => setGallery(v)} show={gallery} />
      <DraftsDialog show={drafts} setShow={(v) => setDrafts(v)} />
      <BookmarksDialog show={bookmarks && !!activeUser} setShow={(v) => setBookmarks(v)} />
      <SchedulesDialog show={schedules && !!activeUser} setShow={(v) => setSchedules(v)} />
      <FragmentsDialog show={fragments && !!activeUser} setShow={(v) => setFragments(v)} />
    </>
  );
}
