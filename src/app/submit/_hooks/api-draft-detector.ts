import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import usePrevious from "react-use/lib/usePrevious";
import { PollsContext } from "./polls-manager";
import { Draft } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { QueryIdentifiers } from "@/core/react-query";
import { getDrafts } from "@/api/private-api";
import { useLocation } from "react-use";

export function useApiDraftDetector(
  draftId: string | undefined,
  onDraftLoaded: (draft: Draft) => void,
  onInvalidDraft: () => void
) {
  const { setActivePoll } = useContext(PollsContext);
  const activeUser = useGlobalStore((s) => s.activeUser);
  const queryClient = useQueryClient();

  const location = useLocation();
  const previousLocation = usePrevious(location);

  const draftsQuery = useQuery({
    queryKey: [QueryIdentifiers.DRAFTS, activeUser?.username],
    queryFn: async () => {
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
    initialData: []
  });
  const draftQuery = useQuery({
    queryKey: [QueryIdentifiers.BY_DRAFT_ID, draftId],
    queryFn: () => {
      const existingDraft = draftsQuery.data.find((draft) => draft._id === draftId);

      if (!existingDraft) {
        onInvalidDraft();
        return;
      }

      return existingDraft;
    },
    enabled: draftsQuery.data.length > 0 && !!draftId
  });

  useEffect(() => {
    if (draftQuery.data) {
      onDraftLoaded(draftQuery.data);
      setActivePoll(draftQuery.data.meta?.poll);
    }
  }, [draftQuery.data, onDraftLoaded, setActivePoll]);

  useEffect(() => {
    // location change. only occurs once a draft picked on drafts dialog
    if (location.pathname !== previousLocation?.pathname) {
      queryClient.invalidateQueries({
        queryKey: [QueryIdentifiers.BY_DRAFT_ID, draftId]
      });
    }
  }, [location.pathname, draftId, previousLocation?.pathname, queryClient]);
}
