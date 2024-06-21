import { ThreadItem } from "../deck-items";
import { DeckThreadsForm } from "../../deck-threads-form";
import React, { useContext, useState } from "react";
import { IdentifiableEntry } from "../deck-threads-manager";
import "./_deck-thread-item-viewer-reply.scss";
import { EntriesCacheContext, useEntryCache } from "@/core/caches";
import { classNameObject } from "@ui/util";
import i18next from "i18next";

interface Props {
  entry: IdentifiableEntry;
  isHighlighted?: boolean;
  parentEntry: IdentifiableEntry;
  incrementParentEntryCount: () => void;
}

export const DeckThreadItemViewerReply = ({
  entry: initialEntry,
  isHighlighted,
  parentEntry,
  incrementParentEntryCount
}: Props) => {
  const { addReply, updateRepliesCount } = useContext(EntriesCacheContext);

  const { data: entry } = useEntryCache(initialEntry);

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={classNameObject({
        "deck-thread-item-viewer-reply": true,
        highlighted: isHighlighted
      })}
    >
      <ThreadItem
        pure={true}
        initialEntry={entry}
        onMounted={() => {}}
        onResize={() => {}}
        sequenceItem={isExpanded}
        onEntryView={() => setIsExpanded(!isExpanded)}
        commentsSlot={isExpanded ? <>{i18next.t("decks.columns.hide-replies")}</> : undefined}
      />
      {isExpanded && (
        <DeckThreadsForm
          inline={true}
          placeholder={i18next.t("decks.threads-form.write-your-reply")}
          replySource={entry}
          onSuccess={(reply) => {
            // Update entry in global cache
            addReply(entry, reply);
            incrementParentEntryCount();
          }}
        />
      )}
      {isExpanded && (
        <div className="deck-thread-item-viewer-reply-sequence">
          {entry.replies.map((reply) => (
            <DeckThreadItemViewerReply
              key={reply.post_id}
              entry={reply}
              parentEntry={entry}
              incrementParentEntryCount={() =>
                updateRepliesCount(parentEntry, parentEntry.children + 1)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
