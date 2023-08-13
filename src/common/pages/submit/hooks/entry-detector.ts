import { QueryIdentifiers, useEntryCache } from "../../../core";
import { MatchType } from "../types";
import { useQuery } from "@tanstack/react-query";
import * as bridgeApi from "../../../api/bridge";
import { error } from "../../../components/feedback";
import { formatError } from "../../../api/operations";
import { Entry } from "../../../store/entries/types";
import { useEffect } from "react";
import { History } from "history";

export function useEntryDetector(
  match: MatchType,
  history: History,
  onEntryDetected: (entry?: Entry) => void
) {
  const { data } = useEntryCache("", match.params.username, match.params.username);
  const { data: normalizedEntry } = useQuery(
    [QueryIdentifiers.NORMALIZED_ENTRY, match.params.username, match.params.permlink],
    async () => {
      try {
        const response = await bridgeApi.normalizePost(data);

        if (!response) {
          error("Could not fetch post data.");
          history.push("/submit");
          return;
        }

        return response;
      } catch (e) {
        error(...formatError(e));
        return;
      }
    },
    {
      enabled: !!data
    }
  );

  useEffect(() => {
    onEntryDetected(normalizedEntry);
  }, [normalizedEntry]);
}
