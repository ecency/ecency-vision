import { ThreadItem } from "../deck-items";
import { DeckThreadsForm } from "../../deck-threads-form";
import React, { useState } from "react";
import { IdentifiableEntry } from "../deck-threads-manager";
import "./_deck-thread-item-viewer-reply.scss";
import { EcencyEntriesCacheManagement } from "@/core/caches";
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
  const { data: entry } = EcencyEntriesCacheManagement.getEntryQuery(initialEntry).useClientQuery();

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
        initialEntry={entry!}
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
            EcencyEntriesCacheManagement.addReply(entry, reply);
            incrementParentEntryCount();
          }}
        />
      )}
      {isExpanded && (
        <div className="deck-thread-item-viewer-reply-sequence">
          {entry?.replies.map((reply) => (
            <DeckThreadItemViewerReply
              key={reply.post_id}
              entry={reply}
              parentEntry={entry}
              incrementParentEntryCount={() =>
                EcencyEntriesCacheManagement.updateRepliesCount(
                  parentEntry,
                  parentEntry.children + 1
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
