import { Entry } from "../../../../store/entries/types";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { useResizeDetector } from "react-resize-detector";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { UserAvatar } from "../../../user-avatar";
import { Link } from "react-router-dom";
import { dateToRelative } from "../../../../helper/parse-date";
import { proxifyImageSrc, renderPostBody } from "@ecency/render-helper";
import _ from "lodash";
import { DeckThreadPostItem } from "./deck-thread-post-item";

export interface ThreadItemProps {
  entry: Entry;
  onMounted: () => void;
  onEntryView: () => void;
  onResize: () => void;
}
export const ThreadItem = ({ entry, onMounted, onEntryView, onResize }: ThreadItemProps) => {
  const { global } = useMappedStore();
  const { height, ref } = useResizeDetector();

  const renderAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onMounted();
  }, []);

  useEffect(() => {
    onResize();

    renderAreaRef.current
      ?.querySelectorAll<HTMLLinkElement>(".markdown-tag-link")
      .forEach((element) => {
        element.href = `/trending/${element.dataset.tag}`;
        element.target = "_blank";
      });

    renderAreaRef.current
      ?.querySelectorAll<HTMLLinkElement>(".markdown-post-link")
      .forEach((element) => {
        const { author, permlink } = element.dataset;

        if (author && permlink) {
          element.href = `/@${author}/${permlink}`;
          element.target = "_blank";
          ReactDOM.hydrate(<DeckThreadPostItem author={author} permlink={permlink} />, element);
        }
      });
  }, [height]);

  return (
    <div ref={ref} className="thread-item d-flex flex-column border-bottom p-3">
      <div className="thread-item-header">
        <UserAvatar size="deck-item" global={global} username={entry.author} />
        <Link className="username" to={`/@${entry.author}`}>
          {entry.author}
        </Link>
        <div className="host">
          <Link to={`/created/${entry.category}`}>#{entry.parent_author}</Link>
        </div>

        <div className="date">{`${dateToRelative(entry.created)}`}</div>
      </div>
      <div className="thread-item-body">
        <div
          ref={renderAreaRef}
          className="thread-render"
          dangerouslySetInnerHTML={{ __html: renderPostBody(entry) }}
        />
        {entry.json_metadata &&
          entry.json_metadata.image &&
          _.isArray(entry.json_metadata.image) &&
          entry.json_metadata.image.length > 0 && (
            <div
              className="search-post-image d-flex align-self-center mt-3"
              style={{
                backgroundImage: `url(${proxifyImageSrc(
                  entry.json_metadata.image[0],
                  undefined,
                  undefined,
                  global.canUseWebp ? "webp" : "match"
                )})`
              }}
            />
          )}
      </div>
    </div>
  );
};
