import React, { useContext, useEffect, useState } from "react";
import { Entry } from "../../../store/entries/types";
import { _t } from "../../../i18n";
import { EntryLink } from "../../entry-link";
import { checkSvg } from "../../../img/svg";
import { DeckThreadsContext } from "../columns/deck-threads-manager";
import { useEntryChecking } from "../utils";
import { Spinner } from "@ui/spinner";
import { Alert } from "@ui/alert";

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
          <div className="d-flex align-items-center">
            <div className="icon">
              {!isLocal(lastEntry) ? checkSvg : <Spinner className="w-4 h-4" />}
            </div>
            <div className="pl-3">
              {!isLocal(lastEntry)
                ? _t("decks.threads-form.successfully-created")
                : _t("decks.threads-form.pending")}
            </div>
          </div>
          {!isLocal(lastEntry) && (
            <EntryLink target="_blank" entry={lastEntry}>
              <span>{_t("decks.threads-form.link-to-entry")}</span>
            </EntryLink>
          )}
        </Alert>
      )}
    </div>
  );
};
