import { ThreadItem } from "../deck-items";
import { DeckThreadsForm } from "../../deck-threads-form";
import { _t } from "../../../../i18n";
import React, { useContext, useState } from "react";
import { IdentifiableEntry } from "../deck-threads-manager";
import { History } from "history";
import "./_deck-thread-item-viewer-reply.scss";
import { classNameObject } from "../../../../helper/class-name-object";
import { EntriesCacheContext, useEntryCache } from "../../../../core";

interface Props {
  entry: IdentifiableEntry;
  history: History;
  isHighlighted?: boolean;
  parentEntry: IdentifiableEntry;
  incrementParentEntryCount: () => void;
}

export const DeckThreadItemViewerReply = ({
  entry: initialEntry,
  history,
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
        history={history}
        onMounted={() => {}}
        onResize={() => {}}
        sequenceItem={isExpanded}
        onEntryView={() => setIsExpanded(!isExpanded)}
        commentsSlot={isExpanded ? <>{_t("decks.columns.hide-replies")}</> : undefined}
      />
      {isExpanded && (
        <DeckThreadsForm
          inline={true}
          placeholder={_t("decks.threads-form.write-your-reply")}
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
              history={history}
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
