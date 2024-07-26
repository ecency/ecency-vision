"use client";

import Image from "next/image";
import { volumeOffSvg } from "@ui/svg";
import i18next from "i18next";
import React, { useEffect, useMemo, useState } from "react";
import { Entry } from "@/entities";
import { EntryListItemThumbnail } from "@/features/shared/entry-list-item/entry-list-item-thumbnail";
import { EntryLink } from "@/features/shared";
import { postBodySummary } from "@ecency/render-helper";
import { useGlobalStore } from "@/core/global-store";
import { EcencyClientServerBridge } from "@/core/client-server-bridge";
import { EntryListItemContext } from "@/features/shared/entry-list-item/entry-list-item-context";
import { getMutedUsersQuery } from "@/api/queries/get-muted-users-query";

interface Props {
  entry: Entry;
}

export function EntryListItemMutedContent({ entry: entryProp }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { showNsfw } = EcencyClientServerBridge.useSafeContext(EntryListItemContext);

  const [showMuted, setShowMuted] = useState(false);
  const [showModMuted, setShowModMuted] = useState(false);
  const { data: mutedUsers } = getMutedUsersQuery(activeUser).useClientQuery();

  const isPostMuted = useMemo(
    () => (activeUser && mutedUsers?.includes(entryProp.author)) ?? false,
    [activeUser, entryProp.author, mutedUsers]
  );
  const entry = useMemo(() => entryProp.original_entry || entryProp, [entryProp]);
  const isCrossPost = useMemo(() => !!entry.original_entry, [entry.original_entry]);
  const nsfw = useMemo(
    () =>
      entry.json_metadata &&
      entry.json_metadata.tags &&
      Array.isArray(entry.json_metadata.tags) &&
      entry.json_metadata.tags.includes("nsfw"),
    [entry]
  );

  useEffect(() => {
    setShowMuted(false);
  }, [activeUser]);

  useEffect(() => {
    setShowMuted(isPostMuted);
  }, [isPostMuted]);

  useEffect(() => {
    setShowModMuted(entry.stats?.gray ?? false);
  }, [entry]);

  return showModMuted && showMuted ? (
    <>
      <div className="item-image item-image-nsfw">
        <Image
          width={600}
          height={600}
          className="w-full"
          src="/assets/nsfw.png"
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
          noImage="/assets/noimage.png"
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
  );
}
