import React, { useEffect, useState } from "react";
import "./_deck-post-viewer.scss";
import useMount from "react-use/lib/useMount";
import { renderPostBody } from "@ecency/render-helper";
import { DeckPostViewerCommentBox } from "./deck-post-viewer-comment-box";
import { commentSvg, voteSvg } from "../../icons";
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
import { Entry } from "@/entities";
import { useEntryCache } from "@/core/caches";
import { arrowLeftSvg } from "@ui/svg";
import i18next from "i18next";
import { EntryInfo, EntryVoteBtn, EntryVotes } from "@/features/shared";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  entry: Entry;
  history: History;
  backTitle?: string;
  onClose: () => void;
}

export const DeckPostViewer = ({ entry: initialEntry, onClose, history, backTitle }: Props) => {
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);

  const [isMounted, setIsMounted] = useState(false);
  const [renderInitiated, setRenderInitiated] = useState(false);

  const { data: entry } = useEntryCache(initialEntry);

  const { height, ref } = useResizeDetector();

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
    renderAuthors(ref);
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
          <Button
            className="flex pt-[0.35rem]"
            outline={true}
            href={entry.url}
            target="_blank"
            size="sm"
          >
            {i18next.t("decks.columns.view-full-post")}
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
        dangerouslySetInnerHTML={{ __html: renderPostBody(entry, true, canUseWebp) }}
      />
      <div className="bottom-actions p-3">
        <EntryVoteBtn entry={entry} isPostSlider={false} />
        <EntryVotes entry={entry} icon={voteSvg} />
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
