"use client";

import React from "react";
import { success } from "../feedback";
import "./_index.scss";
import { useMenuItemsGenerator } from "./menu-items-generator";
import { Entry } from "@/entities";
import { getCommunityCache, useCommunityPin } from "@/core/caches";
import { useGlobalStore } from "@/core/global-store";
import { useDeleteComment, usePinToBlog } from "@/api/mutations";
import { useRouter } from "next/navigation";
import { dotsHorizontal, shareVariantSvg } from "@ui/svg";
import {
  EntryShare,
  shareFacebook,
  shareReddit,
  shareTwitter
} from "@/features/shared/entry-share";
import i18next from "i18next";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { CrossPost } from "@/features/shared/entry-menu/cross-post";
import { EditHistory } from "@/features/shared/edit-history";
import { Button, ModalConfirm } from "@/features/ui";
import { MuteBtn } from "@/features/shared/mute-btn";
import { Promote } from "@/features/shared/promote";
import { UilFacebook, UilRedditAlienAlt, UilTwitter } from "@iconscout/react-unicons";

interface Props {
  entry: Entry;
  extraMenuItems?: any[];
  separatedSharing?: boolean;
  alignBottom?: boolean;
  toggleEdit?: () => void;
  pinEntry?: (entry: Entry | null) => void;
}

export const EntryMenu = ({
  entry,
  separatedSharing = false,
  alignBottom,
  extraMenuItems,
  toggleEdit,
  pinEntry
}: Props) => {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const router = useRouter();

  const { data: community } = getCommunityCache(entry.category).useClientQuery();
  const { mutateAsync: pinToBlog } = usePinToBlog(entry, () => pinEntry?.(pin ? entry : null));
  const { mutateAsync: pinToCommunity } = useCommunityPin(entry, community);
  const { mutateAsync: deleteAction } = useDeleteComment(entry, () => router.push("/"));

  const {
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
  } = useMenuItemsGenerator(entry, community, separatedSharing, toggleEdit, extraMenuItems);

  return (
    <div className="entry-menu">
      {separatedSharing && (
        <div className="separated-share">
          <div className="share-button single-button" onClick={() => setShare(false)}>
            {shareVariantSvg}
          </div>
          <div className="all-buttons">
            <Button
              size="sm"
              appearance="gray-link"
              onClick={() => shareReddit(entry)}
              icon={<UilRedditAlienAlt />}
            />
            <Button
              size="sm"
              appearance="gray-link"
              onClick={() => shareTwitter(entry)}
              icon={<UilTwitter />}
            />

            <Button
              size="sm"
              appearance="gray-link"
              onClick={() => shareFacebook(entry)}
              icon={<UilFacebook />}
            />
          </div>
        </div>
      )}
      <Dropdown>
        <DropdownToggle>
          <Button appearance="gray-link" size="sm" icon={dotsHorizontal} />
        </DropdownToggle>
        <DropdownMenu align="right">
          {menuItems.map((item, i) => (
            <DropdownItemWithIcon
              key={i}
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
            />
          ))}
        </DropdownMenu>
      </Dropdown>

      {activeUser && cross && (
        <CrossPost
          entry={entry}
          onHide={() => setCross(false)}
          onSuccess={(community) => {
            setCross(false);
            router.push(`/created/${community}`);
          }}
        />
      )}
      {share && <EntryShare entry={entry} onHide={() => setShare(false)} />}
      {editHistory && <EditHistory entry={entry} onHide={() => setEditHistory(false)} />}
      {delete_ && (
        <ModalConfirm
          onConfirm={() => {
            deleteAction();
            setDelete_(false);
          }}
          onCancel={() => setDelete_(false)}
        />
      )}
      {pin && (
        <ModalConfirm
          onConfirm={() => {
            if (pinKey === "community") {
              pinToCommunity(true);
            } else if (pinKey === "blog") {
              pinToBlog({ pin: true });
            }
            setPin(false);
            setPinKey("");
          }}
          onCancel={() => {
            setPin(false);
            setPinKey("");
          }}
        />
      )}
      {unpin && (
        <ModalConfirm
          onConfirm={() => {
            if (pinKey === "community") {
              pinToCommunity(false);
            } else if (pinKey === "blog") {
              pinToBlog({ pin: false });
            }
            setUnpin(false);
            setPinKey("");
          }}
          onCancel={() => {
            setUnpin(false);
            setPinKey("");
          }}
        />
      )}
      {community && activeUser && mute && (
        <MuteBtn
          onlyDialog={true}
          entry={entry}
          community={community}
          onSuccess={(entry, mute) => {
            setMute(false);

            if (pin) {
              success(i18next.t("entry-menu.mute-success"));
            } else {
              success(i18next.t("entry-menu.unmute-success"));
            }
          }}
          onCancel={() => setMute(false)}
        />
      )}
      {activeUser && promote && <Promote entry={entry} onHide={() => setPromote(false)} />}
    </div>
  );
};
