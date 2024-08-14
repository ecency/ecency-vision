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
import { useGlobalStore } from "@/core/global-store";
import { useMemo, useRef } from "react";
import { useDistanceDetector } from "@/app/[...slugs]/_entry-components/distance-detector";
import { EcencyClientServerBridge } from "@/core/client-server-bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components/context";
import { useRouter } from "next/navigation";
import { Button } from "@ui/button";
import { UilEye } from "@iconscout/react-unicons";

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
    <div className="entry-controls text-sm flex-wrap gap-4" ref={ref}>
      <div className="flex items-center">
        <EntryVoteBtn isPostSlider={true} entry={entry} />
        <EntryPayout entry={entry} />
        <EntryVotes entry={entry} />
        <EntryTipBtn entry={entry} />
        {!isOwnEntry && <EntryReblogBtn entry={entry} />}
      </div>
      <span className="flex-spacer" />
      <div className="flex items-center">
        <Tooltip content={i18next.t("entry.raw")}>
          <Button
            size="sm"
            appearance="gray-link"
            onClick={() => setIsRawContent(!isRawContent)}
            icon={<UilEye />}
          />
        </Tooltip>
        <BookmarkBtn entry={entry} />
        <div className="border-l border-[--border-color] h-6 ml-4 w-[1px]" />
        <EntryMenu
          entry={entry}
          alignBottom={true}
          separatedSharing={true}
          toggleEdit={() => router.push(`/${entry.url}/edit`)}
        />
      </div>
    </div>
  );
}
