import { useEffect, useState } from "react";
import { MenuItem } from "../dropdown";
import { _t } from "../../i18n";
import {
  bullHornSvg,
  deleteForeverSvg,
  historySvg,
  linkVariantSvg,
  pencilOutlineSvg,
  pinSvg,
  rocketLaunchSvg,
  shareVariantSvg,
  shuffleVariantSvg,
  volumeOffSvg
} from "../../img/svg";
import { Entry } from "../../store/entries/types";
import { useMappedStore } from "../../store/use-mapped-store";
import { Community, ROLES } from "../../store/communities/types";
import clipboard from "../../util/clipboard";
import { success } from "../feedback";
import { FullAccount } from "../../store/accounts/types";
import { History } from "history";
import isCommunity from "../../helper/is-community";
import { useCommunityPinCache } from "../../core";

export function useMenuItemsGenerator(
  entry: Entry,
  community: Community | null,
  separatedSharing: boolean,
  toggleEdit: (() => void) | undefined,
  history: History,
  extraMenuItems?: MenuItem[]
) {
  const { activeUser, global, toggleUIProp } = useMappedStore();
  const { data: isPinned } = useCommunityPinCache(entry);

  const [cross, setCross] = useState(false);
  const [share, setShare] = useState(false);
  const [editHistory, setEditHistory] = useState(false);
  const [delete_, setDelete_] = useState(false);
  const [pin, setPin] = useState(false);
  const [pinKey, setPinKey] = useState("");
  const [unpin, setUnpin] = useState(false);
  const [mute, setMute] = useState(false);
  const [promote, setPromote] = useState(false);
  const [boost, setBoost] = useState(false);
  const [canMute, setCanMute] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    generate();
  }, []);

  useEffect(() => {
    generate();
  }, [isPinned, activeUser, global, community, canMute, separatedSharing, extraMenuItems]);

  useEffect(() => {
    setCanMute(
      activeUser && community
        ? !!community.team.find(
            (m) =>
              m[0] === activeUser.username &&
              [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
          )
        : false
    );
  }, [activeUser]);

  const generate = () => {
    const isComment = !!entry.parent_author;
    const isOwn = !!activeUser && activeUser.username === entry.author;
    const isCross = activeUser && !isComment && isCommunity(entry.category);
    const isDeletable = isOwn && !(entry.children > 0 || entry.net_rshares > 0 || entry.is_paidout);
    const activeUserWithProfile = activeUser?.data as FullAccount;
    const profile = activeUserWithProfile && activeUserWithProfile.profile;
    const canUnpinCommunity = isTeamManager() && isPinned;
    const canUnpinBlog = isOwn && entry.permlink === profile?.pinned;
    const canPinCommunity = isTeamManager() && !canUnpinCommunity;
    const canPinBlog = isOwn && !canUnpinBlog;

    setMenuItems([
      ...(isOwn
        ? [
            {
              label: _t("g.edit"),
              onClick:
                isComment && toggleEdit
                  ? toggleEdit
                  : () => history.push(`/@${entry.author}/${entry.permlink}/edit`),
              icon: pencilOutlineSvg
            }
          ]
        : []),
      ...(isCross
        ? [
            {
              label: _t("entry-menu.cross-post"),
              onClick: () => setCross(!cross),
              icon: shuffleVariantSvg
            }
          ]
        : []),
      ...(canMute
        ? [
            {
              label: !!entry.stats?.gray ? _t("entry-menu.unmute") : _t("entry-menu.mute"),
              onClick: () => setMute(!mute),
              icon: volumeOffSvg
            }
          ]
        : []),
      ...(extraMenuItems ?? []),
      ...(global.usePrivate
        ? [
            {
              label: _t("entry-menu.edit-history"),
              onClick: () => setEditHistory(!editHistory),
              icon: historySvg
            },
            {
              label: _t("entry-menu.promote"),
              onClick:
                activeUser !== null ? () => setPromote(!promote) : () => toggleUIProp("login"),
              icon: bullHornSvg
            },
            {
              label: _t("entry-menu.boost"),
              onClick: activeUser !== null ? () => setBoost(!boost) : () => toggleUIProp("login"),
              icon: rocketLaunchSvg
            },
            {
              label: _t("entry.address-copy"),
              onClick: copyAddress,
              icon: linkVariantSvg
            }
          ]
        : []),
      ...(!separatedSharing
        ? [
            {
              label: _t("entry-menu.share"),
              onClick: () => setShare(!share),
              icon: shareVariantSvg
            }
          ]
        : []),
      ...(canUnpinCommunity
        ? [
            {
              label: _t("entry-menu.unpin-from-community"),
              onClick: () => toggleUnpin("community"),
              icon: pinSvg
            }
          ]
        : []),
      ...(canUnpinBlog
        ? [
            {
              label: _t("entry-menu.unpin-from-blog"),
              onClick: () => toggleUnpin("blog"),
              icon: pinSvg
            }
          ]
        : []),
      ...(canPinCommunity
        ? [
            {
              label: _t("entry-menu.pin-to-community"),
              onClick: () => togglePin("community"),
              icon: pinSvg
            }
          ]
        : []),
      ...(canPinBlog
        ? [
            {
              label: _t("entry-menu.pin-to-blog"),
              onClick: () => togglePin("blog"),
              icon: pinSvg
            }
          ]
        : []),
      ...(isDeletable
        ? [
            {
              label: _t("g.delete"),
              onClick: () => setDelete_(!delete_),
              icon: deleteForeverSvg
            }
          ]
        : [])
    ]);
  };

  const copyAddress = () => {
    let u;
    if (activeUser?.username) {
      u = `https://ecency.com/${entry.category}/@${entry.author}/${entry.permlink}?referral=${activeUser.username}`;
    } else {
      u = `https://ecency.com/${entry.category}/@${entry.author}/${entry.permlink}`;
    }
    clipboard(u);
    success(_t("entry.address-copied"));
  };

  const togglePin = (key = "") => {
    setPin(!pin);
    setPinKey(key);
  };

  const toggleUnpin = (key = "") => {
    setUnpin(!unpin);
    setPinKey(key);
  };

  const isTeamManager = () =>
    activeUser && community
      ? !!community.team.find((m) => {
          return (
            m[0] === activeUser.username &&
            [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
          );
        })
      : false;

  return {
    menuItems,
    cross,
    setCross,
    share,
    setShare,
    editHistory,
    setEditHistory,
    delete_,
    setDelete_,
    pin,
    setPin,
    pinKey,
    setPinKey,
    unpin,
    setUnpin,
    mute,
    setMute,
    promote,
    setPromote,
    boost,
    setBoost
  };
}
