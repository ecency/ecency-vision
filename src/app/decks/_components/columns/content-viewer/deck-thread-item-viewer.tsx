import React, { useCallback, useContext, useMemo, useRef } from "react";
import { DeckThreadItemSkeleton, ThreadItem } from "../deck-items";
import { IdentifiableEntry } from "../deck-threads-manager";
import { DeckThreadsForm } from "../../deck-threads-form";
import { DeckThreadItemViewerReply } from "./deck-thread-item-viewer-reply";
import { repliesIconSvg } from "../../icons";
import { Button } from "@ui/button";
import { EntriesCacheContext, useEntryCache } from "@/core/caches";
import i18next from "i18next";
import { arrowLeftSvg } from "@ui/svg";
import {
  addReplyToDiscussionsList,
  getDiscussionsMapQuery
} from "@/api/queries/get-discussions-query";
import { useMounted } from "@/utils/use-mounted";

interface Props {
  entry: IdentifiableEntry;
  backTitle?: string;
  onClose: () => void;
  highlightedEntry?: string;
}

export const DeckThreadItemViewer = ({
  entry: initialEntry,
  backTitle,
  onClose,
  highlightedEntry
}: Props) => {
  const { addReply, updateCache, updateRepliesCount } = useContext(EntriesCacheContext);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const { data: entry } = useEntryCache<IdentifiableEntry>(initialEntry);
  const isMounted = useMounted();

  const { data: discussions } = getDiscussionsMapQuery(entry, updateCache).useClientQuery();

  const build = useCallback(
    (dataset: Record<string, IdentifiableEntry>) => {
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
          } else if (
            result.every((r) => r.author !== value.author && r.permlink !== value.permlink)
          ) {
            result.push(value);
          }
        });
      return result;
    },
    [entry.permlink]
  );

  const data = useMemo(() => {
    const tempResponse = { ...discussions };
    Object.values(tempResponse).forEach((i) => {
      i.host = entry.host;
    });

    return build(tempResponse);
  }, [build, discussions, entry.host]);

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
      </div>
      <ThreadItem
        pure={true}
        initialEntry={entry}
        onEntryView={() => {}}
        onMounted={() => {}}
        onResize={() => {}}
      />
      <DeckThreadsForm
        inline={true}
        placeholder={i18next.t("decks.threads-form.write-your-reply")}
        replySource={entry}
        onSuccess={(reply) => {
          reply.replies = [];
          if (data) {
            addReplyToDiscussionsList(entry, reply);
            // Update entry in global cache
            addReply(entry, reply);
          }
        }}
      />
      <div className="deck-thread-item-viewer-replies">
        {data.length > 0 && (
          <>
            {data.map((reply) => (
              <DeckThreadItemViewerReply
                isHighlighted={highlightedEntry === `${reply.author}/${reply.permlink}`}
                key={reply.post_id}
                entry={reply as IdentifiableEntry}
                parentEntry={entry}
                incrementParentEntryCount={() => updateRepliesCount(entry, entry.children + 1)}
              />
            ))}
            {data.length === 0 && (
              <div className="no-replies-placeholder">
                {repliesIconSvg}
                <p>{i18next.t("decks.columns.no-replies")}</p>
                <Button
                  outline={true}
                  size="sm"
                  onClick={() =>
                    (
                      rootRef.current?.querySelector(".editor-control") as HTMLElement | null
                    )?.focus()
                  }
                >
                  {i18next.t("decks.columns.add-new-reply")}
                </Button>
              </div>
            )}
          </>
        )}

        <div className="skeleton-list">
          {data.length === 0 &&
            Array.from(new Array(20)).map((_, i) => <DeckThreadItemSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
};
