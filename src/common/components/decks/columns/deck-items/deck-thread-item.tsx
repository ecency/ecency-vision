import { useMappedStore } from "../../../../store/use-mapped-store";
import { useResizeDetector } from "react-resize-detector";
import React, { useContext, useEffect, useState } from "react";
import { UserAvatar } from "../../../user-avatar";
import { Link } from "react-router-dom";
import { dateToRelative } from "../../../../helper/parse-date";
import EntryVoteBtn from "../../../entry-vote-btn";
import { History } from "history";
import { Button, Spinner } from "react-bootstrap";
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
}

export const ThreadItem = ({
  initialEntry,
  onMounted,
  onEntryView,
  onResize,
  history,
  pure,
  sequenceItem,
  commentsSlot,
  onSeeFullThread,
  onAppear
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
  });

  useEffect(() => {
    onMounted();
  }, []);

  useEffect(() => {
    setIntervalStarted(status === "pending");
  }, [status]);

  useEffect(() => {
    if (inViewport && onAppear) {
      onAppear();
    }
  }, [inViewport]);

  useEffect(() => {
    setHasParent(
      !!entry.parent_author && !!entry.parent_permlink && entry.parent_author !== entry.host
    );

    if (typeof entry.post_id === "string") {
      setStatus("pending");
    } else {
      setStatus("default");
    }
  }, [entry]);

  return (
    <div
      ref={ref}
      className={classNameObject({
        "thread-item border-bottom": true,
        "has-parent": hasParent && !pure,
        pure,
        "sequence-item": sequenceItem,
        pending: status === "pending"
      })}
      onClick={(event) => {
        if (event.target === ref.current) {
          onEntryView();
        }
      }}
    >
      <div className="thread-item-header">
        <UserAvatar size="deck-item" global={global} username={entry.author} />
        <div className="username text-truncate">
          <Link to={`/@${entry.author}`}>{entry.author}</Link>
          {activeUser?.username === entry.author && (
            <span className="you">{`(${_t("g.you")})`}</span>
          )}
          {hasParent && !pure && (
            <>
              <span>{_t("decks.columns.replied-to")}</span>
              <Link to={`/@${entry.parent_author}`}>{entry.parent_author}</Link>
            </>
          )}
        </div>
        <div className="host">
          <Link target="_blank" to={`/created/${entry.category}`}>
            #{entry.host}
          </Link>
        </div>

        <div className="date">
          {status === "default" && (
            <Link target="_blank" to={`/@${entry.author}/${entry.permlink}`}>
              {`${dateToRelative(entry.created)}`}
            </Link>
          )}
          {status === "pending" && <Spinner animation="border" />}
        </div>
      </div>
      <DeckThreadItemBody
        entry={entry}
        height={height}
        renderInitiated={renderInitiated}
        setRenderInitiated={setRenderInitiated}
        onResize={onResize}
      />
      {status === "default" && (
        <div className="thread-item-actions">
          <EntryVoteBtn
            entry={entry}
            isPostSlider={false}
            history={history}
            afterVote={(votes, estimated) => {
              updateVotes(entry.post_id, votes, estimated);
            }}
          />
          <EntryVotes history={history!!} entry={entry} icon={voteSvg} />
          <Button variant="link" onClick={() => onEntryView()}>
            <div className="d-flex align-items-center comments">
              <div style={{ paddingRight: 4 }}>{commentSvg}</div>
              <div>{commentsSlot ?? entry.children}</div>
            </div>
          </Button>
        </div>
      )}
      {hasParent && !pure && (
        <div className="thread-item-parent">
          <UserAvatar size="small" global={global} username={entry.parent_author!!} />
          <Button variant="link" className="host" onClick={onSeeFullThread}>
            {_t("decks.columns.see-full-thread")}
          </Button>
        </div>
      )}
    </div>
  );
};
