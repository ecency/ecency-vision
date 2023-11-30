import { useMappedStore } from "../../../store/use-mapped-store";
import usePrevious from "react-use/lib/usePrevious";
import { useQueryClient } from "@tanstack/react-query";
import { ChatQueries } from "../queries";
import { NostrQueries } from "../nostr/queries";
import { useEffect } from "react";

export function useActiveUserSwitching() {
  const { activeUser } = useMappedStore();
  const previousActiveUser = usePrevious(activeUser);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (activeUser?.username !== previousActiveUser?.username) {
      queryClient.setQueryData([NostrQueries.PUBLIC_MESSAGES], []);
      queryClient.setQueryData([NostrQueries.DIRECT_MESSAGES], []);
      queryClient.setQueryData([ChatQueries.LEFT_CHANNELS], []);

      queryClient.invalidateQueries([NostrQueries.PUBLIC_MESSAGES]);
      queryClient.invalidateQueries([NostrQueries.DIRECT_MESSAGES]);
      queryClient.invalidateQueries([ChatQueries.LEFT_CHANNELS]);
      queryClient.invalidateQueries([ChatQueries.MESSAGES]);
    }
  }, [activeUser, previousActiveUser]);
}
