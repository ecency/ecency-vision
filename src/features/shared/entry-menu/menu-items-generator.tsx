import { useCallback, useEffect, useState } from "react";
import { success } from "../feedback";
import { Community, Entry, FullAccount, ROLES } from "@/entities";
import { useCommunityPinCache } from "@/core/caches";
import useMount from "react-use/lib/useMount";
import { bullHornSvg } from "@ui/svg";
import i18next from "i18next";
import { clipboard } from "@/utils/clipboard";
import { useGlobalStore } from "@/core/global-store";
import { useRouter } from "next/navigation";
import { MenuItem } from "@ui/dropdown";
import { isCommunity } from "@/utils";
import {
  UilHistory,
  UilHistoryAlt,
  UilLink,
  UilMapPin,
  UilPen,
  UilShare,
  UilTrash,
  UilVolume,
  UilVolumeOff
} from "@iconscout/react-unicons";

export function useMenuItemsGenerator(
  entry: Entry,
  community: Community | null | undefined,
  separatedSharing: boolean,
  toggleEdit: (() => void) | undefined,
  extraMenuItems?: MenuItem[]
) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);
  const usePrivate = useGlobalStore((state) => state.usePrivate);

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
  const [canMute, setCanMute] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const router = useRouter();

  useMount(() => {
    generate();
  });

  useEffect(() => {
    setCanMute(
      activeUser && community
        ? !!community.team?.find(
            (m) =>
              m[0] === activeUser.username &&
              [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
          )
        : false
    );
  }, [activeUser, community]);

  const copyAddress = useCallback(() => {
    let u;
    if (activeUser?.username) {
      u = `https://ecency.com/${entry.category}/@${entry.author}/${entry.permlink}?referral=${activeUser.username}`;
    } else {
      u = `https://ecency.com/${entry.category}/@${entry.author}/${entry.permlink}`;
    }
    clipboard(u);
    success(i18next.t("entry.address-copied"));
  }, [activeUser?.username, entry.author, entry.category, entry.permlink]);

  const togglePin = useCallback(
    (key = "") => {
      setPin(!pin);
      setPinKey(key);
    },
    [pin]
  );

  const toggleUnpin = useCallback(
    (key = "") => {
      setUnpin(!unpin);
      setPinKey(key);
    },
    [unpin]
  );

  const isTeamManager = useCallback(
    () =>
      activeUser && community
        ? !!community.team?.find((m) => {
            return (
              m[0] === activeUser.username &&
              [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
            );
          })
        : false,
    [activeUser, community]
  );

  const generate = useCallback(() => {
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
              label: i18next.t("g.edit"),
              onClick:
                isComment && toggleEdit
                  ? toggleEdit
                  : () => router.push(`/@${entry.author}/${entry.permlink}/edit`),
              icon: <UilPen />
            }
          ]
        : []),
      ...(isCross
        ? [
            {
              label: i18next.t("entry-menu.cross-post"),
              onClick: () => setCross(!cross),
              icon: <UilHistory />
            }
          ]
        : []),
      ...(canMute
        ? [
            {
              label: !!entry.stats?.gray
                ? i18next.t("entry-menu.unmute")
                : i18next.t("entry-menu.mute"),
              onClick: () => setMute(!mute),
              icon: !!entry.stats?.gray ? <UilVolumeOff /> : <UilVolume />
            }
          ]
        : []),
      ...(extraMenuItems ?? []),
      ...(usePrivate
        ? [
            {
              label: i18next.t("entry-menu.edit-history"),
              onClick: () => setEditHistory(!editHistory),
              icon: <UilHistoryAlt />
            },
            {
              label: i18next.t("entry-menu.promote"),
              onClick:
                activeUser !== null ? () => setPromote(!promote) : () => toggleUIProp("login"),
              icon: bullHornSvg
            },
            {
              label: i18next.t("entry.address-copy"),
              onClick: copyAddress,
              icon: <UilLink />
            }
          ]
        : []),
      ...(!separatedSharing
        ? [
            {
              label: i18next.t("entry-menu.share"),
              onClick: () => setShare(!share),
              icon: <UilShare />
            }
          ]
        : []),
      ...(canUnpinCommunity
        ? [
            {
              label: i18next.t("entry-menu.unpin-from-community"),
              onClick: () => toggleUnpin("community"),
              icon: <UilMapPin />
            }
          ]
        : []),
      ...(canUnpinBlog
        ? [
            {
              label: i18next.t("entry-menu.unpin-from-blog"),
              onClick: () => toggleUnpin("blog"),
              icon: <UilMapPin />
            }
          ]
        : []),
      ...(canPinCommunity
        ? [
            {
              label: i18next.t("entry-menu.pin-to-community"),
              onClick: () => togglePin("community"),
              icon: <UilMapPin />
            }
          ]
        : []),
      ...(canPinBlog
        ? [
            {
              label: i18next.t("entry-menu.pin-to-blog"),
              onClick: () => togglePin("blog"),
              icon: <UilMapPin />
            }
          ]
        : []),
      ...(isDeletable
        ? [
            {
              label: i18next.t("g.delete"),
              onClick: () => setDelete_(!delete_),
              icon: <UilTrash />
            }
          ]
        : [])
    ]);
  }, [
    activeUser,
    canMute,
    copyAddress,
    cross,
    delete_,
    editHistory,
    entry.author,
    entry.category,
    entry.children,
    entry.is_paidout,
    entry.net_rshares,
    entry.parent_author,
    entry.permlink,
    entry.stats?.gray,
    extraMenuItems,
    isPinned,
    isTeamManager,
    mute,
    promote,
    router,
    separatedSharing,
    share,
    toggleEdit,
    togglePin,
    toggleUIProp,
    toggleUnpin,
    usePrivate
  ]);

  useEffect(() => {
    generate();
  }, [isPinned, activeUser, community, canMute, separatedSharing, extraMenuItems, generate]);

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
    setPromote
  };
}
