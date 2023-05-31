import { History } from "history";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { arrowLeftSvg } from "../../../../img/svg";
import { _t } from "../../../../i18n";
import useMount from "react-use/lib/useMount";
import { DeckThreadItemSkeleton, ThreadItem } from "../deck-items";
import { getDiscussion } from "../../../../api/bridge";
import { IdentifiableEntry } from "../deck-threads-manager";
import { DeckThreadsForm } from "../../deck-threads-form";
import moment from "moment";
import { DeckThreadItemViewerReply } from "./deck-thread-item-viewer-reply";
import { EntriesCacheContext, useEntryCache } from "../../../../core";
import { repliesIconSvg } from "../../icons";

interface Props {
  entry: IdentifiableEntry;
  history: History;
  backTitle?: string;
  onClose: () => void;
  highlightedEntry?: string;
}

export const DeckThreadItemViewer = ({
  entry: initialEntry,
  history,
  backTitle,
  onClose,
  highlightedEntry
}: Props) => {
  const { addReply, updateCache, updateRepliesCount } = useContext(EntriesCacheContext);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const { data: entry } = useEntryCache<IdentifiableEntry>(initialEntry);

  const [data, setData] = useState<IdentifiableEntry | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useMount(() => setIsMounted(true));

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const response = await getDiscussion(entry.author, entry.permlink);

    if (response) {
      const tempResponse = { ...response } as Record<string, IdentifiableEntry>;
      Object.values(tempResponse).forEach((i) => {
        i.host = entry.host;
      });

      const nextData = buildReplyNode(entry, tempResponse);
      setData(nextData);
      setIsLoaded(true);
    }
  };

  const buildReplyNode = (root: IdentifiableEntry, dataset: Record<string, IdentifiableEntry>) => {
    if (root.replies.length > 0) {
      root.replies = root.replies
        .filter((r) => r !== `${root.author}/${root.permlink}`)
        .map((r) => (r instanceof Object ? `${r.author}/${r.permlink}` : r))
        .map((r) => buildReplyNode(dataset[r], dataset));
      root.replies.sort((a, b) => (moment(a.created).isAfter(b.created) ? -1 : 1));
    }

    // Update entry in global cache
    updateCache([root]);

    return root;
  };

  return (
    <div
      ref={rootRef}
      className={"deck-post-viewer deck-thread-item-viewer " + (isMounted ? "visible" : "")}
    >
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
      </div>
      <ThreadItem
        pure={true}
        initialEntry={entry}
        onEntryView={() => {}}
        history={history}
        onMounted={() => {}}
        onResize={() => {}}
      />
      <DeckThreadsForm
        inline={true}
        placeholder={_t("decks.threads-form.write-your-reply")}
        replySource={entry}
        onSuccess={(reply) => {
          reply.replies = [];
          if (data) {
            setData({ ...data, replies: [reply, ...data.replies] });

            // Update entry in global cache
            addReply(entry.post_id, reply);
          }
        }}
      />
      <div className="deck-thread-item-viewer-replies">
        {isLoaded && (
          <>
            {data?.replies.map((reply) => (
              <DeckThreadItemViewerReply
                isHighlighted={highlightedEntry === `${reply.author}/${reply.permlink}`}
                key={reply.post_id}
                entry={reply}
                history={history}
                parentEntry={entry}
                incrementParentEntryCount={() =>
                  updateRepliesCount(entry.post_id, entry.children + 1)
                }
              />
            ))}
            {data?.replies.length === 0 && (
              <div className="no-replies-placeholder">
                {repliesIconSvg}
                <p>{_t("decks.columns.no-replies")}</p>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    (
                      rootRef.current?.querySelector(".editor-control") as HTMLElement | null
                    )?.focus()
                  }
                >
                  {_t("decks.columns.add-new-reply")}
                </Button>
              </div>
            )}
          </>
        )}

        <div className="skeleton-list">
          {!isLoaded && Array.from(new Array(20)).map((_, i) => <DeckThreadItemSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
};
