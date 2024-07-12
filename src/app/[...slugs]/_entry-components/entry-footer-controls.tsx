"use client";

import i18next from "i18next";
import {
  BookmarkBtn,
  EntryMenu,
  EntryPayout,
  EntryReblogBtn,
  EntryTipBtn,
  EntryVoteBtn,
  EntryVotes
} from "@/features/shared";
import { Entry } from "@/entities";
import { Tooltip } from "@ui/tooltip";
import { rawContentSvg } from "@ui/svg";
import { useGlobalStore } from "@/core/global-store";
import { useMemo, useRef } from "react";
import { useDistanceDetector } from "@/app/[...slugs]/_entry-components/distance-detector";
import { EcencyClientServerBridge } from "@/core/bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components/context";
import { useRouter } from "next/navigation";

interface Props {
  entry: Entry;
}

export function EntryFooterControls({ entry }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    showProfileBox,
    setShowProfileBox,
    showWordCount,
    setShowWordCount,
    setIsRawContent,
    isRawContent
  } = EcencyClientServerBridge.useSafeContext(EntryPageContext);

  const activeUser = useGlobalStore((s) => s.activeUser);
  const isOwnEntry = useMemo(
    () => activeUser?.username === entry.author,
    [activeUser?.username, entry.author]
  );

  useDistanceDetector(ref, showProfileBox, showWordCount, setShowProfileBox, setShowWordCount);

  return (
    <div className="entry-controls" ref={ref}>
      <EntryVoteBtn isPostSlider={true} entry={entry} />
      <EntryPayout entry={entry} />
      <EntryVotes entry={entry} />
      <EntryTipBtn entry={entry} />
      {!isOwnEntry && <EntryReblogBtn entry={entry} />}
      <span className="flex-spacer" />
      <Tooltip content={i18next.t("entry.raw")}>
        <span className="raw-content-icon" onClick={() => setIsRawContent(!isRawContent)}>
          {rawContentSvg}
        </span>
      </Tooltip>
      <BookmarkBtn entry={entry} />
      <EntryMenu
        entry={entry}
        alignBottom={true}
        separatedSharing={true}
        toggleEdit={() => router.push(`/${entry.url}/edit`)}
      />
    </div>
  );
}
