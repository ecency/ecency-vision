import React, { useState } from "react";
import { Entry } from "../../../../store/entries/types";
import "./_deck-post-viewer.scss";
import useMount from "react-use/lib/useMount";
import { Button } from "react-bootstrap";
import { arrowLeftSvg } from "../../../../img/svg";
import { renderPostBody } from "@ecency/render-helper";
import { EntryInfo } from "../../../entry-info";
import { History } from "history";
import Discussion from "../../../discussion";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { useLocation } from "react-router";
import { DeckPostViewerCommentBox } from "./deck-post-viewer-comment-box";
import { _t } from "../../../../i18n";

interface Props {
  entry: Entry;
  history: History;
  backTitle?: string;
  onClose: () => void;
}

export const DeckPostViewer = ({ entry, onClose, history, backTitle }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  const store = useMappedStore();
  const location = useLocation();

  useMount(() => setIsMounted(true));

  return (
    <div className={"deck-post-viewer " + (isMounted ? "visible" : "")}>
      <div className="deck-post-viewer-header">
        <div className="actions d-flex pt-3 mr-3">
          <Button
            variant="link"
            onClick={() => {
              setIsMounted(false);
              onClose();
            }}
          >
            {arrowLeftSvg}
            {backTitle}
          </Button>
          <Button variant="outline-primary" href={entry.url} target="_blank" size="sm">
            {_t("decks.columns.view-full-post")}
          </Button>
        </div>
        <div className="title p-3 pb-4 d-flex">
          <span>{entry.title}</span>
        </div>
      </div>
      <div className="px-3">
        <EntryInfo entry={entry} history={history} />
      </div>
      <div
        className="px-3 pb-4 markdown-view"
        dangerouslySetInnerHTML={{ __html: renderPostBody(entry) }}
      />
      <div className="px-3">
        <DeckPostViewerCommentBox entry={entry} onReplied={() => {}} />
      </div>
      <div className="px-3">
        <Discussion
          {...store}
          parent={entry}
          community={null}
          hideControls={false}
          history={history}
          location={location}
          isRawContent={false}
        />
      </div>
    </div>
  );
};
