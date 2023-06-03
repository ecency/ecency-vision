import React, { useContext, useEffect, useState } from "react";
import { Entry } from "../../../store/entries/types";
import { Alert, Spinner } from "react-bootstrap";
import { _t } from "../../../i18n";
import { EntryLink } from "../../entry-link";
import useInterval from "react-use/lib/useInterval";
import * as bridgeApi from "../../../api/bridge";
import { useMappedStore } from "../../../store/use-mapped-store";
import { checkSvg } from "../../../img/svg";
import { DeckThreadsContext } from "../columns/deck-threads-manager";

interface Props {
  lastEntry?: Entry;
  setLastEntry: (v?: Entry) => void;
}

export const DeckThreadsCreatedRecently = ({ lastEntry, setLastEntry }: Props) => {
  const { activeUser } = useMappedStore();
  const { reload } = useContext(DeckThreadsContext);

  const [intervalStarted, setIntervalStarted] = useState(false);

  const isLocal = ({ post_id }: Entry) => post_id === 1 || typeof post_id === "string";

  useEffect(() => {
    if (lastEntry) {
      setIntervalStarted(true);
    }
  }, [lastEntry]);

  useInterval(
    async () => {
      // Checking for transaction status
      if (lastEntry && isLocal(lastEntry)) {
        try {
          const entry = await bridgeApi.getPost(activeUser!.username, lastEntry.permlink);
          const isAlreadyAdded = lastEntry.permlink === entry?.permlink && !isLocal(lastEntry);
          if (entry && !isAlreadyAdded) {
            setLastEntry(entry);

            // Reload all columns after thread item creation
            reload();

            setTimeout(() => {
              setLastEntry(undefined);
              setIntervalStarted(false);
            }, 5000);
          }
        } catch (e) {}
      }
    },
    intervalStarted ? 3000 : null
  );

  return (
    <div className="deck-threads-created-recently">
      {lastEntry && (
        <Alert variant={!isLocal(lastEntry) ? "success" : "secondary"} key={lastEntry.post_id}>
          <div className="d-flex align-items-center">
            <div className="icon">
              {!isLocal(lastEntry) ? checkSvg : <Spinner animation="border" />}
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
