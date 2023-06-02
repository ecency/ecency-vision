import React from "react";
import { DeckThreadItemHeader } from "./deck-thread-item-header";
import { ThreadItemEntry } from "../deck-threads-manager";
import { DeckThreadsForm } from "../../deck-threads-form";

interface Props {
  entry: ThreadItemEntry;
  onSuccess: () => void;
}

export const DeckThreadEditItem = ({ entry, onSuccess }: Props) => {
  return (
    <div className="thread-item">
      <DeckThreadItemHeader status="default" entry={entry} pure={false} hasParent={false} />
      <DeckThreadsForm entry={entry} hideAvatar={true} inline={true} onSuccess={onSuccess} />
    </div>
  );
};
