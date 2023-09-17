import { History } from "history";
import React, { useContext, useEffect, useRef, useState } from "react";
import { arrowLeftSvg } from "../../../../img/svg";
import { _t } from "../../../../i18n";
import useMount from "react-use/lib/useMount";
import { DeckThreadItemSkeleton, ThreadItem } from "../deck-items";
import { getDiscussion } from "../../../../api/bridge";
import { IdentifiableEntry } from "../deck-threads-manager";
import { DeckThreadsForm } from "../../deck-threads-form";
import { DeckThreadItemViewerReply } from "./deck-thread-item-viewer-reply";
import { EntriesCacheContext, useEntryCache } from "../../../../core";
import { repliesIconSvg } from "../../icons";
import { Entry } from "../../../../store/entries/types";
import { Button } from "@ui/button";

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

  const [data, setData] = useState<Entry[]>([]);
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

      const nextData = build(tempResponse);
      setData(nextData);
      setIsLoaded(true);
    }
  };

  const build = (dataset: Record<string, IdentifiableEntry>) => {
    const result: IdentifiableEntry[] = [];
    const values = [...Object.values(dataset).filter((v) => v.permlink !== entry.permlink)];
    Object.entries(dataset)
      .filter(([_, v]) => v.permlink !== entry.permlink)
      .forEach(([key, value]) => {
        const parent = values.find((v) => v.replies.includes(key));
        if (parent) {
          const existingTempIndex = result.findIndex(
            (v) => v.author === parent.author && v.permlink === parent.permlink
          );
          if (existingTempIndex > -1) {
            result[existingTempIndex].replies.push(value);
            result[existingTempIndex].replies = result[existingTempIndex].replies.filter(
              (r) => r !== key
            );
          } else {
            parent.replies.push(value);
            parent.replies = parent.replies.filter((r) => r !== key);
            result.push(parent);
          }
        } else {
          result.push(value);
        }
      });
    return result;
  };

  return (
    <div
      ref={rootRef}
      className={"deck-post-viewer deck-thread-item-viewer " + (isMounted ? "visible" : "")}
    >
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
            setData([reply, ...data]);

            // Update entry in global cache
            addReply(entry, reply);
          }
        }}
      />
      <div className="deck-thread-item-viewer-replies">
        {isLoaded && (
          <>
            {data.map((reply) => (
              <DeckThreadItemViewerReply
                isHighlighted={highlightedEntry === `${reply.author}/${reply.permlink}`}
                key={reply.post_id}
                entry={reply as IdentifiableEntry}
                history={history}
                parentEntry={entry}
                incrementParentEntryCount={() => updateRepliesCount(entry, entry.children + 1)}
              />
            ))}
            {data.length === 0 && (
              <div className="no-replies-placeholder">
                {repliesIconSvg}
                <p>{_t("decks.columns.no-replies")}</p>
                <Button
                  outline={true}
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
