import { useMappedStore } from "../../../../store/use-mapped-store";
import { useResizeDetector } from "react-resize-detector";
import React, { useContext, useEffect, useState } from "react";
import { UserAvatar } from "../../../user-avatar";
import EntryVoteBtn from "../../../entry-vote-btn";
import { History } from "history";
import { _t } from "../../../../i18n";
import { IdentifiableEntry } from "../deck-threads-manager";
import { commentSvg, voteSvg } from "../../icons";
import EntryVotes from "../../../entry-votes";
import { DeckThreadItemBody } from "./deck-thread-item-body";
import { classNameObject } from "../../../../helper/class-name-object";
import { useInViewport } from "react-in-viewport";
import { EntriesCacheContext, useEntryCache } from "../../../../core";
import { useEntryChecking } from "../../utils";
import { Entry } from "../../../../store/entries/types";
import { DeckThreadItemHeader } from "./deck-thread-item-header";
import { dateToRelative } from "../../../../helper/parse-date";
import EntryMenu from "../../../entry-menu";
import { Button } from "@ui/button";

export interface ThreadItemProps {
  initialEntry: IdentifiableEntry;
  history: History;
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
  history,
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
  const { global, activeUser } = useMappedStore();
  const { height, ref } = useResizeDetector();
  const { inViewport } = useInViewport(ref);
  const { data: entry } = useEntryCache<IdentifiableEntry>(initialEntry);

  const [renderInitiated, setRenderInitiated] = useState(false);
  const [hasParent, setHasParent] = useState(false);
  const [status, setStatus] = useState<"default" | "pending">("default");
  const [intervalStarted, setIntervalStarted] = useState(false);

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
      {entry.updated !== entry.created && (
        <div className="px-3 pb-3 updated-label">
          {_t("decks.columns.updated", { n: dateToRelative(entry.updated) })}
        </div>
      )}
      {status === "default" && (
        <div className="thread-item-actions">
          <div>
            <EntryVoteBtn
              entry={entry}
              isPostSlider={false}
              history={history}
              afterVote={(votes, estimated) => {
                updateVotes(entry, votes, estimated);
              }}
            />
            <EntryVotes history={history!!} entry={entry} icon={voteSvg} />
            <Button appearance="link" onClick={() => onEntryView()}>
              <div className="flex items-center comments">
                <div style={{ paddingRight: 4 }}>{commentSvg}</div>
                <div>{commentsSlot ?? entry.children}</div>
              </div>
            </Button>
          </div>
          <div>
            <EntryMenu history={history} entry={entry} />
            {activeUser?.username === entry.author && (
              <Button className="edit-btn" appearance="link" onClick={() => onEdit(entry)}>
                {_t("decks.columns.edit-wave")}
              </Button>
            )}
          </div>
        </div>
      )}
      {hasParent && !pure && (
        <div className="thread-item-parent">
          <UserAvatar size="small" global={global} username={entry.parent_author!!} />
          <Button appearance="link" className="host" onClick={onSeeFullThread}>
            {_t("decks.columns.see-full-thread")}
          </Button>
        </div>
      )}
    </div>
  );
};
