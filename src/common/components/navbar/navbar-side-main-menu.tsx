import React, { useMemo, useState } from "react";
import { _t } from "../../i18n";
import Gallery from "../gallery";
import Drafts from "../drafts";
import Bookmarks from "../bookmarks";
import Schedules from "../schedules";
import Fragments from "../fragments";
import { useMappedStore } from "../../store/use-mapped-store";
import { History } from "history";
import {
  UilArchive,
  UilClock,
  UilDocumentInfo,
  UilFavorite,
  UilImages,
  UilSetting,
  UilSignin,
  UilSignout,
  UilUser
} from "@iconscout/react-unicons";
import { NavbarSideMainMenuItem } from "./navbar-side-main-menu-item";

interface Props {
  history: History;
}

export function NavbarSideMainMenu({ history }: Props) {
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
        href: `/@${activeUser?.username}`,
        icon: <UilUser size={16} />
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
        onClick: () => history.push(`/@${activeUser?.username}/settings`),
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
        {mainMenu.map(({ label, onClick, icon }) => (
          <NavbarSideMainMenuItem key={label} label={label} onClick={onClick} icon={icon} />
        ))}
        <hr className="my-2" />
        {authMenu.map(({ label, onClick, icon }) => (
          <NavbarSideMainMenuItem key={label} label={label} onClick={onClick} icon={icon} />
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
