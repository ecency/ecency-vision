import { MatchType } from "../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../../../core";
import { Draft, getDrafts } from "../../../api/private-api";
import { useMappedStore } from "../../../store/use-mapped-store";
import { useEffect } from "react";
import { Location } from "history";
import usePrevious from "react-use/lib/usePrevious";

export function useApiDraftDetector(
  match: MatchType,
  location: Location,
  onDraftLoaded: (draft: Draft) => void
) {
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
    () => draftsQuery.data.find((draft) => draft._id === match.params.draftId),
    {
      enabled: draftsQuery.data.length > 0 && !!match.params.draftId
    }
  );

  useEffect(() => {
    if (draftQuery.data) {
      onDraftLoaded(draftQuery.data);
    }
  }, [draftQuery.data]);

  useEffect(() => {
    // location change. only occurs once a draft picked on drafts dialog
    if (location.pathname !== previousLocation?.pathname) {
      queryClient.invalidateQueries([QueryIdentifiers.BY_DRAFT_ID, match.params.draftId]);
    }
  }, [location.pathname, match.params.draftId]);
}
