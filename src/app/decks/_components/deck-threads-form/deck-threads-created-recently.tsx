import React, { useContext, useEffect, useState } from "react";
import { DeckThreadsContext } from "../columns/deck-threads-manager";
import { useEntryChecking } from "../utils";
import { Spinner } from "@ui/spinner";
import { Alert } from "@ui/alert";
import { Entry } from "@/entities";
import { checkSvg } from "@ui/svg";
import { EntryLink } from "@/features/shared";
import i18next from "i18next";

interface Props {
  lastEntry?: Entry;
  setLastEntry: (v?: Entry) => void;
}

export const DeckThreadsCreatedRecently = ({ lastEntry, setLastEntry }: Props) => {
  const { reload } = useContext(DeckThreadsContext);

  const [intervalStarted, setIntervalStarted] = useState(false);

  const isLocal = ({ post_id }: Entry) => post_id === 1 || typeof post_id === "string";

  useEntryChecking(lastEntry, intervalStarted, (entry) => {
    setLastEntry(entry);

    // Reload all columns after thread item creation
    reload();

    setTimeout(() => {
      setLastEntry(undefined);
      setIntervalStarted(false);
    }, 5000);
  });

  useEffect(() => {
    if (lastEntry) {
      setIntervalStarted(true);
    }
  }, [lastEntry]);

  return (
    <div className="deck-threads-created-recently">
      {lastEntry && (
        <Alert appearance={!isLocal(lastEntry) ? "success" : "secondary"} key={lastEntry.post_id}>
          <div className="flex items-center">
            <div className="icon">
              {!isLocal(lastEntry) ? checkSvg : <Spinner className="w-4 h-4" />}
            </div>
            <div className="pl-3">
              {!isLocal(lastEntry)
                ? i18next.t("decks.threads-form.successfully-created")
                : i18next.t("decks.threads-form.pending")}
            </div>
          </div>
          {!isLocal(lastEntry) && (
            <EntryLink target="_blank" entry={lastEntry}>
              <span>{i18next.t("decks.threads-form.link-to-entry")}</span>
            </EntryLink>
          )}
        </Alert>
      )}
    </div>
  );
};
