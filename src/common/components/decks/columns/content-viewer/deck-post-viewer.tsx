import React, { useContext, useEffect, useState } from "react";
import { Entry } from "../../../../store/entries/types";
import "./_deck-post-viewer.scss";
import useMount from "react-use/lib/useMount";
import { arrowLeftSvg } from "../../../../img/svg";
import { renderPostBody } from "@ecency/render-helper";
import { EntryInfo } from "../../../entry-info";
import { History } from "history";
import { Discussion } from "../../../discussion";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { DeckPostViewerCommentBox } from "./deck-post-viewer-comment-box";
import { _t } from "../../../../i18n";
import { commentSvg, voteSvg } from "../../icons";
import EntryVoteBtn from "../../../entry-vote-btn";
import { EntriesCacheContext, useEntryCache } from "../../../../core";
import EntryVotes from "../../../entry-votes";
import { useResizeDetector } from "react-resize-detector";
import {
  renderAuthors,
  renderCurrencies,
  renderExternalLinks,
  renderPostLinks,
  renderTags,
  renderTweets,
  renderVideos
} from "../deck-items/deck-thread-item-body-render-helper";
import { Button } from "@ui/button";

interface Props {
  entry: Entry;
  history: History;
  backTitle?: string;
  onClose: () => void;
}

export const DeckPostViewer = ({ entry: initialEntry, onClose, history, backTitle }: Props) => {
  const [isMounted, setIsMounted] = useState(false);
  const [renderInitiated, setRenderInitiated] = useState(false);

  const { data: entry } = useEntryCache(initialEntry);

  const { height, ref } = useResizeDetector();
  const store = useMappedStore();
  const { updateVotes } = useContext(EntriesCacheContext);

  useMount(() => setIsMounted(true));

  useEffect(() => {
    if (!renderInitiated) {
      extendedRenderBody();
    }
  }, [height]);

  const extendedRenderBody = async () => {
    setRenderInitiated(true);

    if (ref.current) {
      ref.current.innerHTML = await renderCurrencies(ref?.current?.innerHTML);
    }

    renderTags(ref);
    renderAuthors(ref, store.global);
    renderPostLinks(ref);
    renderExternalLinks(ref);
    renderVideos(ref);
    renderTweets(ref);
  };

  return (
    <div className={"deck-post-viewer " + (isMounted ? "visible" : "")}>
      <div className="deck-post-viewer-header">
        <div className="actions flex pt-3 mr-3">
          <Button
            appearance="link"
            onClick={() => {
              setIsMounted(false);
              onClose();
            }}
            icon={arrowLeftSvg}
            iconPlacement="left"
          >
            {backTitle}
          </Button>
          <Button outline={true} href={entry.url} target="_blank" size="sm">
            {_t("decks.columns.view-full-post")}
          </Button>
        </div>
        <div className="title p-3 pb-4 flex">
          <span>{entry.title}</span>
        </div>
      </div>
      <div className="px-3">
        <EntryInfo entry={entry} history={history} />
      </div>
      <div
        ref={ref}
        className="px-3 pb-4 markdown-view"
        dangerouslySetInnerHTML={{ __html: renderPostBody(entry, true, store.global.canUseWebp) }}
      />
      <div className="bottom-actions p-3">
        <EntryVoteBtn
          entry={entry}
          isPostSlider={false}
          history={history}
          afterVote={(votes, estimated) => {
            updateVotes(entry.post_id, votes, estimated);
          }}
        />
        <EntryVotes history={history!!} entry={entry} icon={voteSvg} />
        <div className="flex items-center comments">
          <div style={{ paddingRight: 4 }}>{commentSvg}</div>
          {entry.children}
        </div>
      </div>
      <div className="px-3 dark:[&>*>.comment-preview]:bg-dark-default">
        <DeckPostViewerCommentBox entry={entry} onReplied={() => {}} />
      </div>
      <div className="px-3">
        <Discussion
          parent={entry}
          community={null}
          hideControls={false}
          history={history}
          isRawContent={false}
        />
      </div>
    </div>
  );
};
