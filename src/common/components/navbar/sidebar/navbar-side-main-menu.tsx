import React, { useMemo, useState } from "react";
import { _t } from "../../../i18n";
import Gallery from "../../gallery";
import Drafts from "../../drafts";
import Bookmarks from "../../bookmarks";
import Schedules from "../../schedules";
import Fragments from "../../fragments";
import { useMappedStore } from "../../../store/use-mapped-store";
import { History } from "history";
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
  UilUser
} from "@iconscout/react-unicons";
import { NavbarSideMainMenuItem } from "./navbar-side-main-menu-item";

interface Props {
  history: History;
  onHide: () => void;
}

export function NavbarSideMainMenu({ history, onHide }: Props) {
  const { activeUser, global, ui, setActiveUser, toggleUIProp } = useMappedStore();

  const [gallery, setGallery] = useState(false);
  const [drafts, setDrafts] = useState(false);
  const [bookmarks, setBookmarks] = useState(false);
  const [schedules, setSchedules] = useState(false);
  const [fragments, setFragments] = useState(false);

  const mainMenu = useMemo(
    () => [
      {
        label: _t("user-nav.profile"),
        to: `/@${activeUser?.username}`,
        icon: <UilUser size={16} />,
        onClick: () => onHide()
      },
      ...(global.usePrivate
        ? [
            {
              label: _t("user-nav.drafts"),
              onClick: () => setDrafts(!drafts),
              icon: <UilDocumentInfo size={16} />
            },
            {
              label: _t("user-nav.gallery"),
              onClick: () => setGallery(!gallery),
              icon: <UilImages size={16} />
            },
            {
              label: _t("user-nav.bookmarks"),
              onClick: () => setBookmarks(!bookmarks),
              icon: <UilFavorite size={16} />
            },
            {
              label: _t("user-nav.schedules"),
              onClick: () => setSchedules(!schedules),
              icon: <UilClock size={16} />
            },
            {
              label: _t("user-nav.fragments"),
              onClick: () => setFragments(!fragments),
              icon: <UilArchive size={16} />
            }
          ]
        : []),
      {
        label: _t("user-nav.settings"),
        to: `/@${activeUser?.username}/settings`,
        onClick: () => onHide(),
        icon: <UilSetting size={16} />
      }
    ],
    []
  );

  const authMenu = useMemo(
    () => [
      {
        label: _t("g.login-as"),
        onClick: () => toggleUIProp("login"),
        icon: <UilSignin size={16} />
      },
      {
        label: _t("user-nav.logout"),
        icon: <UilSignout size={16} />,
        onClick: () => {
          setActiveUser(null);
        }
      }
    ],
    []
  );

  return (
    <>
      <div className="px-4 flex flex-col gap-0.5">
        {mainMenu.map(({ label, onClick, icon, to }) => (
          <NavbarSideMainMenuItem to={to} key={label} label={label} onClick={onClick} icon={icon} />
        ))}
        <hr className="my-2" />
        <NavbarSideMainMenuItem
          label={_t("market.swap-title")}
          to="/market#swap"
          onClick={onHide}
          icon={<UilMoneyWithdraw size={16} />}
        />
        <NavbarSideMainMenuItem
          label={_t("market.advanced-title")}
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
      {gallery && <Gallery onHide={() => setGallery(false)} />}
      {drafts && <Drafts history={history} onHide={() => setDrafts(false)} />}
      {bookmarks && <Bookmarks history={history} onHide={() => setBookmarks(false)} />}
      {schedules && <Schedules history={history} onHide={() => setSchedules(false)} />}
      {fragments && <Fragments onHide={() => setFragments(false)} />}
    </>
  );
}
