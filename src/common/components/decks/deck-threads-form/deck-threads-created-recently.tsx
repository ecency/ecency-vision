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

  useEffect(() => {
    if (lastEntry) {
      setIntervalStarted(true);
    }
  }, [lastEntry]);

  useInterval(
    async () => {
      // Checking for transaction status
      if (lastEntry && lastEntry.post_id === 1) {
        try {
          const entry = await bridgeApi.getPost(activeUser!.username, lastEntry.permlink);
          const isAlreadyAdded = lastEntry.permlink === entry?.permlink && lastEntry.post_id !== 1;
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
        <Alert variant={lastEntry.post_id !== 1 ? "success" : "secondary"} key={lastEntry.post_id}>
          <div className="d-flex align-items-center">
            <div className="icon">
              {lastEntry.post_id !== 1 ? checkSvg : <Spinner animation="border" />}
            </div>
            <div className="pl-3">
              {lastEntry.post_id !== 1
                ? _t("decks.threads-form.successfully-created")
                : _t("decks.threads-form.pending")}
            </div>
          </div>
          {lastEntry.post_id !== 1 && (
            <EntryLink target="_blank" entry={lastEntry}>
              <span>{_t("decks.threads-form.link-to-entry")}</span>
            </EntryLink>
          )}
        </Alert>
      )}
    </div>
  );
};
