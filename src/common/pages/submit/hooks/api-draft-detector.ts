import { MatchType } from "../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../../../core";
import { Draft, getDrafts } from "../../../api/private-api";
import { useMappedStore } from "../../../store/use-mapped-store";
import { useContext, useEffect } from "react";
import { Location } from "history";
import usePrevious from "react-use/lib/usePrevious";
import { PollsContext } from "./polls-manager";

export function useApiDraftDetector(
  match: MatchType,
  location: Location,
  onDraftLoaded: (draft: Draft) => void,
  onInvalidDraft: () => void
) {
  const { setActivePoll } = useContext(PollsContext);
  const { activeUser } = useMappedStore();
  const queryClient = useQueryClient();

  const previousLocation = usePrevious(location);

  const draftsQuery = useQuery(
    [QueryIdentifiers.DRAFTS, activeUser?.username],
    async () => {
      if (!activeUser) {
        return [];
      }

      try {
        return await getDrafts(activeUser.username);
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    {
      initialData: []
    }
  );
  const draftQuery = useQuery(
    [QueryIdentifiers.BY_DRAFT_ID, match.params.draftId],
    () => {
      const existingDraft = draftsQuery.data.find((draft) => draft._id === match.params.draftId);

      if (!existingDraft) {
        onInvalidDraft();
        return;
      }

      return existingDraft;
    },
    {
      enabled: draftsQuery.data.length > 0 && !!match.params.draftId
    }
  );

  useEffect(() => {
    if (draftQuery.data) {
      onDraftLoaded(draftQuery.data);
      setActivePoll(draftQuery.data.meta?.poll);
    }
  }, [draftQuery.data]);

  useEffect(() => {
    // location change. only occurs once a draft picked on drafts dialog
    if (location.pathname !== previousLocation?.pathname) {
      queryClient.invalidateQueries([QueryIdentifiers.BY_DRAFT_ID, match.params.draftId]);
    }
  }, [location.pathname, match.params.draftId]);
}
