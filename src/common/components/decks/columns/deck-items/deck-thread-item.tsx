import { useMappedStore } from "../../../../store/use-mapped-store";
import { useResizeDetector } from "react-resize-detector";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { UserAvatar } from "../../../user-avatar";
import { Link } from "react-router-dom";
import { dateToRelative } from "../../../../helper/parse-date";
import { renderPostBody } from "@ecency/render-helper";
import { DeckThreadLinkItem } from "./deck-thread-link-item";
import { renderToString } from "react-dom/server";
import { getCGMarketApi } from "../../../market-swap-form/api/coingecko-api";
import formattedNumber from "../../../../util/formatted-number";
import EntryVoteBtn from "../../../entry-vote-btn";
import { History } from "history";
import { Button } from "react-bootstrap";
import { _t } from "../../../../i18n";
import { IdentifiableEntry } from "../deck-threads-manager";
import { commentSvg, voteSvg } from "../../icons";
import EntryVotes from "../../../entry-votes";
import { DeckThreadItemBody } from "./deck-thread-item-body";

export interface ThreadItemProps {
  entry: IdentifiableEntry;
  history: History;
  onMounted: () => void;
  onEntryView: () => void;
  onResize: () => void;
  pure?: boolean;
  hideHost?: boolean;
}

export const ThreadItem = ({
  entry,
  onMounted,
  onEntryView,
  onResize,
  history,
  pure
}: ThreadItemProps) => {
  const { global } = useMappedStore();
  const { height, ref } = useResizeDetector();

  const [renderInitiated, setRenderInitiated] = useState(false);
  const [hasParent, setHasParent] = useState(false);

  useEffect(() => {
    onMounted();
  }, []);

  useEffect(() => {
    setHasParent(
      !!entry.parent_author && !!entry.parent_permlink && entry.parent_author !== entry.host
    );
  }, [entry]);

  return (
    <div
      ref={ref}
      className={
        "thread-item border-bottom" +
        (hasParent && !pure ? " has-parent" : "") +
        (pure ? " pure" : "")
      }
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
          {hasParent && !pure && (
            <>
              <span>replied to</span>
              <Link to={`/@${entry.parent_author}`}>{entry.parent_author}</Link>
            </>
          )}
        </div>
        <div className="host">
          <Link to={`/created/${entry.category}`}>#{entry.host}</Link>
        </div>

        <div className="date">{`${dateToRelative(entry.created)}`}</div>
      </div>
      <DeckThreadItemBody
        entry={entry}
        height={height}
        renderInitiated={renderInitiated}
        setRenderInitiated={setRenderInitiated}
        onResize={onResize}
      />
      <div className="thread-item-actions">
        <EntryVoteBtn entry={entry} isPostSlider={false} history={history} afterVote={() => {}} />
        <EntryVotes history={history!!} entry={entry} icon={voteSvg} />
        <Button variant="link" onClick={() => onEntryView()}>
          <div className="d-flex align-items-center comments">
            <div style={{ paddingRight: 4 }}>{commentSvg}</div>
            <div>{entry.children}</div>
          </div>
        </Button>
      </div>
      {hasParent && !pure && (
        <div className="thread-item-parent">
          <UserAvatar size="small" global={global} username={entry.parent_author!!} />
          <Button variant="link" className="host">
            {_t("decks.columns.see-full-thread")}
          </Button>
        </div>
      )}
    </div>
  );
};
