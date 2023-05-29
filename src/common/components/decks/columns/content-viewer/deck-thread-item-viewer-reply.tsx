import { ThreadItem } from "../deck-items";
import { DeckThreadsForm } from "../../deck-threads-form";
import { _t } from "../../../../i18n";
import React, { useState } from "react";
import { IdentifiableEntry } from "../deck-threads-manager";
import { History } from "history";
import "./_deck-thread-item-viewer-reply.scss";
import { classNameObject } from "../../../../helper/class-name-object";

interface Props {
  entry: IdentifiableEntry;
  history: History;
  isHighlighted?: boolean;
}

export const DeckThreadItemViewerReply = ({ entry, history, isHighlighted }: Props) => {
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
        entry={entry}
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
            entry.replies = [reply, ...entry.replies];
            entry.children += 1;
          }}
        />
      )}
      {isExpanded && (
        <div className="deck-thread-item-viewer-reply-sequence">
          {entry.replies.map((reply) => (
            <DeckThreadItemViewerReply key={reply.post_id} entry={reply} history={history} />
          ))}
        </div>
      )}
    </div>
  );
};
