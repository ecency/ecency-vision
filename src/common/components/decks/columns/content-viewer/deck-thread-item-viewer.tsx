import { History } from "history";
import React, { useContext, useEffect, useState } from "react";
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
import { EntriesCacheContext } from "../../../../core";

interface Props {
  entry: IdentifiableEntry;
  history: History;
  backTitle?: string;
  onClose: () => void;
  highlightedEntry?: string;
}

export const DeckThreadItemViewer = ({
  entry,
  history,
  backTitle,
  onClose,
  highlightedEntry
}: Props) => {
  const { updateReplies } = useContext(EntriesCacheContext);

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

      entry.replies = tempResponse[`${entry.author}/${entry.permlink}`].replies;

      const nextData = buildReplyNode(entry, tempResponse);
      setData(nextData);
      setIsLoaded(true);

      // Update entry in global cache
      updateReplies(entry.post_id, [...entry.replies]);
    }
  };

  const buildReplyNode = (root: IdentifiableEntry, dataset: Record<string, IdentifiableEntry>) => {
    if (root.replies.length > 0) {
      root.replies = root.replies
        .filter((r) => r !== `${root.author}/${root.permlink}`)
        .map((r) => buildReplyNode(dataset[r], dataset));
      root.replies.sort((a, b) => (moment(a.created).isAfter(b.created) ? -1 : 1));
    }

    return root;
  };

  return (
    <div className={"deck-post-viewer deck-thread-item-viewer " + (isMounted ? "visible" : "")}>
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
            updateReplies(entry.post_id, [reply, ...data.replies]);
          }
        }}
      />
      <div className="deck-thread-item-viewer-replies">
        {isLoaded &&
          data?.replies.map((reply) => (
            <DeckThreadItemViewerReply
              isHighlighted={highlightedEntry === `${reply.author}/${reply.permlink}`}
              key={reply.post_id}
              entry={reply}
              history={history}
            />
          ))}
        <div className="skeleton-list">
          {!isLoaded && Array.from(new Array(20)).map((_, i) => <DeckThreadItemSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
};
