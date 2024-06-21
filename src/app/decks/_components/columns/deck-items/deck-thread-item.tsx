import { useResizeDetector } from "react-resize-detector";
import React, { useContext, useEffect, useState } from "react";
import { IdentifiableEntry } from "../deck-threads-manager";
import { commentSvg, voteSvg } from "../../icons";
import { DeckThreadItemBody } from "./deck-thread-item-body";
import { useInViewport } from "react-in-viewport";
import { useEntryChecking } from "../../utils";
import { DeckThreadItemHeader } from "./deck-thread-item-header";
import { Button } from "@ui/button";
import { EntriesCacheContext, useEntryCache } from "@/core/caches";
import { useGlobalStore } from "@/core/global-store";
import { Entry } from "@/entities";
import { classNameObject } from "@ui/util";
import { PollWidget, useEntryPollExtractor } from "@/features/polls";
import i18next from "i18next";
import { dateToRelative } from "@/utils";
import { EntryMenu, EntryVoteBtn, EntryVotes, UserAvatar } from "@/features/shared";

export interface ThreadItemProps {
  initialEntry: IdentifiableEntry;
  onMounted: () => void;
  onEntryView: () => void;
  onResize: () => void;
  pure?: boolean;
  hideHost?: boolean;
  sequenceItem?: boolean;
  commentsSlot?: JSX.Element;
  onSeeFullThread?: () => void;
  onAppear?: () => void;
  onEdit?: (entry: IdentifiableEntry) => void;
  visible?: boolean;
  triggerPendingStatus?: boolean;
}

export const ThreadItem = ({
  initialEntry,
  onMounted,
  onEntryView,
  onResize,
  pure = false,
  sequenceItem,
  commentsSlot,
  onSeeFullThread,
  onAppear,
  onEdit = () => {},
  visible = true,
  triggerPendingStatus = false
}: ThreadItemProps) => {
  const { updateVotes, updateCache } = useContext(EntriesCacheContext);
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { height, ref } = useResizeDetector();
  const { inViewport } = useInViewport(ref);
  const { data: entry } = useEntryCache<IdentifiableEntry>(initialEntry);

  const [renderInitiated, setRenderInitiated] = useState(false);
  const [hasParent, setHasParent] = useState(false);
  const [status, setStatus] = useState<"default" | "pending">("default");
  const [intervalStarted, setIntervalStarted] = useState(false);

  const poll = useEntryPollExtractor(entry);

  useEntryChecking(entry, intervalStarted, (nextEntry) => {
    updateCache([
      { ...nextEntry, host: initialEntry.host, container: initialEntry.container } as Entry
    ]);
    setIntervalStarted(false);
  });

  useEffect(() => {
    onMounted();
  }, []);

  useEffect(() => {
    if (triggerPendingStatus) {
      setStatus("pending");
    }
  }, [triggerPendingStatus]);

  useEffect(() => {
    setIntervalStarted(typeof entry.post_id === "string" || !entry.post_id || entry.post_id === 1);
  }, [entry]);

  useEffect(() => {
    if (inViewport && onAppear) {
      onAppear();
    }
  }, [inViewport]);

  useEffect(() => {
    setHasParent(
      !!entry.parent_author && !!entry.parent_permlink && entry.parent_author !== entry.host
    );
  }, [entry]);

  useEffect(() => {
    if (entry.updated !== entry.created) {
      setStatus("default");
    }
  }, [entry]);

  return (
    <div
      ref={ref}
      className={classNameObject({
        "thread-item border-b border-[--border-color]": true,
        "has-parent": hasParent && !pure,
        pure,
        "sequence-item": sequenceItem,
        pending: status === "pending",
        hidden: !visible
      })}
      onClick={(event) => {
        if (event.target === ref.current) {
          onEntryView();
        }
      }}
    >
      <DeckThreadItemHeader status={status} entry={entry} hasParent={hasParent} pure={pure} />
      <DeckThreadItemBody
        entry={entry}
        height={height}
        renderInitiated={renderInitiated}
        setRenderInitiated={setRenderInitiated}
        onResize={onResize}
      />
      {poll && (
        <div className="p-4">
          <PollWidget entry={entry} compact={true} poll={poll} isReadOnly={false} />
        </div>
      )}
      {entry.updated !== entry.created && (
        <div className="px-3 pb-3 updated-label">
          {i18next.t("decks.columns.updated", { n: dateToRelative(entry.updated) })}
        </div>
      )}
      {status === "default" && (
        <div className="thread-item-actions">
          <div>
            <EntryVoteBtn entry={entry} isPostSlider={false} />
            <EntryVotes entry={entry} icon={voteSvg} />
            <Button appearance="link" onClick={() => onEntryView()}>
              <div className="flex items-center comments">
                <div style={{ paddingRight: 4 }}>{commentSvg}</div>
                <div>{commentsSlot ?? entry.children}</div>
              </div>
            </Button>
          </div>
          <div>
            <EntryMenu entry={entry} />
            {activeUser?.username === entry.author && (
              <Button className="edit-btn" appearance="link" onClick={() => onEdit(entry)}>
                {i18next.t("decks.columns.edit-wave")}
              </Button>
            )}
          </div>
        </div>
      )}
      {hasParent && !pure && (
        <div className="thread-item-parent">
          <UserAvatar size="small" username={entry.parent_author!!} />
          <Button appearance="link" className="host" onClick={onSeeFullThread}>
            {i18next.t("decks.columns.see-full-thread")}
          </Button>
        </div>
      )}
    </div>
  );
};
