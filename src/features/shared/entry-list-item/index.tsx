"use client";

import React, { useEffect, useMemo, useState } from "react";
import { postBodySummary, setProxyBase } from "@ecency/render-helper";
import { Tsx } from "../../i18n/helper";
import "./_index.scss";
import { useMount, useUnmount } from "react-use";
import { EntryListItemThumbnail } from "./entry-list-item-thumbnail";
import { UilPanelAdd } from "@iconscout/react-unicons";
import defaults from "@/defaults.json";
import { Account, Community, Entry, FullAccount } from "@/entities";
import { dateToFormatted, dateToRelative, truncate } from "@/utils";
import { commentSvg, pinSvg, repeatSvg, volumeOffSvg } from "@ui/svg";
import { StyledTooltip } from "@/features/ui";
import { EntryLink } from "../entry-link";
import {
  EntryMenu,
  EntryPayout,
  EntryReblogBtn,
  EntryVoteBtn,
  EntryVotes,
  ProfileLink,
  ProfilePopover,
  UserAvatar
} from "@/features/shared";
import { classNameObject } from "@ui/util";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { TagLink } from "@/features/shared/tag";
import { Tooltip } from "@ui/tooltip";
import Link from "next/link";
import Image from "next/image";

setProxyBase(defaults.imageServer);

interface Props {
  entry: Entry;
  community?: Community | null;
  asAuthor?: string;
  promoted?: boolean;
  order: number;
  account?: Account;
  muted?: boolean;
}

export function EntryListItem({
  asAuthor = "",
  entry: entryProp,
  community,
  account,
  muted: mutedProp,
  promoted = false,
  order
}: Props) {
  const filter = useGlobalStore((s) => s.filter);
  const activeUser = useGlobalStore((s) => s.activeUser);
  const globalNsfw = useGlobalStore((s) => s.nsfw);

  const pageAccount = account as FullAccount;

  const [showNsfw, setShowNsfw] = useState(false);
  const [showMuted, setShowMuted] = useState(mutedProp);
  const [showModMuted, setShowModMuted] = useState(false);

  useMount(() => {
    document.getElementsByTagName("html")[0].style.position = "relative";
  });

  useUnmount(() => {
    document.getElementsByTagName("html")[0].style.position = "unset";
  });

  useEffect(() => {
    setShowMuted(false);
  }, [activeUser]);

  useEffect(() => {
    setShowMuted(mutedProp ?? false);
  }, [mutedProp]);

  const pinned = useMemo(() => pageAccount?.profile?.pinned, [pageAccount]);

  const isCrossPost = useMemo(() => !!entryProp.original_entry, [entryProp]);
  const entry = useMemo(() => entryProp.original_entry || entryProp, [entryProp]);
  const dateRelative = useMemo(() => dateToRelative(entry.created), [entry]);
  const dateFormatted = useMemo(() => dateToFormatted(entry.created), [entry]);
  const reBlogged = useMemo(() => {
    if (entry.reblogged_by?.length > 0) {
      return entry.reblogged_by[0];
    } else {
      return asAuthor && asAuthor !== entry.author && !entry.parent_author ? asAuthor : undefined;
    }
  }, [entry, asAuthor]);

  const nsfw = useMemo(
    () =>
      entry.json_metadata &&
      entry.json_metadata.tags &&
      Array.isArray(entry.json_metadata.tags) &&
      entry.json_metadata.tags.includes("nsfw"),
    [entry]
  );

  useEffect(() => {
    setShowModMuted(entry.stats?.gray ?? false);
  }, [entry, entryProp]);

  return (
    <div
      className={classNameObject({
        "entry-list-item": true,
        "promoted-item": promoted,
        [filter]: !!filter
      })}
      id={(entry.author + entry.permlink).replace(/[0-9]/g, "")}
    >
      {isCrossPost ? (
        <div className="cross-item">
          <ProfileLink username={entryProp.author}>
            <span className="cross-item-author notranslate">{`@${entryProp.author}`}</span>
          </ProfileLink>{" "}
          {i18next.t("entry-list-item.cross-posted")}{" "}
          <EntryLink entry={entryProp.original_entry!}>
            <a className="cross-item-link">
              {truncate(
                `@${entryProp.original_entry!.author}/${entryProp.original_entry!.permlink}`,
                40
              )}
            </a>
          </EntryLink>{" "}
          {i18next.t("entry-list-item.cross-posted-to")}{" "}
          <TagLink
            type="link"
            tag={
              entryProp.community && entryProp.community_title
                ? { name: entryProp.community, title: entryProp.community_title }
                : entryProp.category
            }
          >
            <a className="community-name">{entryProp.community_title || entryProp.category}</a>
          </TagLink>
        </div>
      ) : null}
      <div className="item-header">
        <div className="item-header-main">
          <div className="author-part" id={`${entry.author}-${entry.permlink}`}>
            <div className="flex items-center" id={`${entry.author}-${entry.permlink}`}>
              <ProfileLink username={entry.author}>
                <span className="author-avatar block">
                  <UserAvatar username={entry.author} size="small" />
                </span>
              </ProfileLink>

              <ProfilePopover entry={entry} />
            </div>
          </div>
          <TagLink
            type="link"
            tag={
              entry.community && entry.community_title
                ? { name: entry.community, title: entry.community_title }
                : entry.category
            }
          >
            <a className="category">{entry.community_title || entry.category}</a>
          </TagLink>
          <span className="read-mark" />
          <span className="date" title={dateFormatted}>
            {dateRelative}
          </span>

          {(entry.json_metadata as any).content_type === "poll" && (
            <StyledTooltip className="flex" content={i18next.t("polls.poll")}>
              <UilPanelAdd className="text-gray-600 dark:text-gray-400" size={16} />
            </StyledTooltip>
          )}
        </div>
        <div className="item-header-features">
          {((community && !!entry.stats?.is_pinned) || entry.permlink === pinned) && (
            <Tooltip content={i18next.t("entry-list-item.pinned")}>
              <span className="pinned">{pinSvg}</span>
            </Tooltip>
          )}
          {reBlogged && (
            <span className="reblogged">
              {repeatSvg} {i18next.t("entry-list-item.reblogged", { n: reBlogged })}
            </span>
          )}
          {promoted && (
            <>
              <span className="flex-spacer" />
              <div className="promoted">
                <a href="/faq#how-promotion-work">{i18next.t("entry-list-item.promoted")}</a>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="item-body">
        {nsfw && !showNsfw && !globalNsfw ? (
          <>
            <div className="item-image item-image-nsfw">
              <Image
                width={600}
                height={600}
                className="w-full"
                src="/assets/img/nsfw.png"
                alt={entry.title}
              />
            </div>
            <div className="item-summary">
              <div className="item-nsfw">
                <span className="nsfw-badge">NSFW</span>
              </div>
              <div className="item-nsfw-options">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowNsfw(true);
                  }}
                >
                  {i18next.t("nsfw.reveal")}
                </a>{" "}
                {i18next.t("g.or").toLowerCase()}{" "}
                {activeUser && (
                  <>
                    {i18next.t("nsfw.settings-1")}{" "}
                    <Link href={`/@${activeUser.username}/settings`}>
                      {i18next.t("nsfw.settings-2")}
                    </Link>
                    {"."}
                  </>
                )}
                {!activeUser && (
                  <>
                    <Tsx k="nsfw.signup">
                      <span />
                    </Tsx>
                    {"."}
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
        {showModMuted && showMuted ? (
          <>
            <div className="item-image item-image-nsfw">
              <Image
                width={600}
                height={600}
                className="w-full"
                src="/assets/img/nsfw.png"
                alt={entry.title}
              />
            </div>
            <div className="item-summary">
              <div className="item-nsfw">
                <span className="nsfw-badge text-capitalize d-inline-flex items-center">
                  <div className="mute-icon">{volumeOffSvg}</div> <div>{i18next.t("g.muted")}</div>
                </span>
              </div>
              <div className="item-nsfw-options">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    showModMuted ? setShowModMuted(false) : setShowMuted(false);
                  }}
                >
                  {showModMuted ? i18next.t("g.modmuted-message") : i18next.t("g.muted-message")}
                </a>
              </div>
            </div>
          </>
        ) : (
          <>
            {(!nsfw || showNsfw) && (
              <EntryListItemThumbnail
                entryProp={entryProp}
                isCrossPost={isCrossPost}
                noImage="/assets/img/noimage.png"
                entry={entry}
              />
            )}
            <div className="item-summary">
              <EntryLink entry={isCrossPost ? entryProp : entry}>
                <div className="item-title">{entry.title}</div>
              </EntryLink>
              <EntryLink entry={isCrossPost ? entryProp : entry}>
                <div className="item-body">
                  {entry.json_metadata.description || postBodySummary(entry, 200)}
                </div>
              </EntryLink>
            </div>
          </>
        )}
        <div className="item-controls">
          <EntryVoteBtn isPostSlider={true} entry={entry} account={account} />
          <EntryPayout entry={entry} />
          <EntryVotes entry={entry} />
          {(entry.children > 0 || entryProp.children > 0) && (
            <EntryLink entry={isCrossPost ? entryProp : entry}>
              <a className="replies notranslate">
                <Tooltip
                  content={
                    entry.children > 0
                      ? entry.children === 1
                        ? i18next.t("entry-list-item.replies")
                        : i18next.t("entry-list-item.replies-n", { n: entry.children })
                      : i18next.t("entry-list-item.no-replies")
                  }
                >
                  <span className="inner">
                    {commentSvg} {entry.children}
                  </span>
                </Tooltip>
              </a>
            </EntryLink>
          )}
          <EntryReblogBtn entry={entry} />
          <EntryMenu alignBottom={order >= 1} entry={entry} />
        </div>
      </div>
    </div>
  );
}
