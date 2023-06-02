import useInterval from "react-use/lib/useInterval";
import * as bridgeApi from "../../../api/bridge";
import { Entry } from "../../../store/entries/types";
import { useMappedStore } from "../../../store/use-mapped-store";

export function useEntryChecking(
  initialEntry: Entry | undefined,
  intervalStarted: boolean,
  onSuccessCheck: (entry: Entry) => void
) {
  const { activeUser } = useMappedStore();

  const isLocal = ({ post_id }: Entry) => post_id === 1 || typeof post_id === "string";

  return useInterval(
    async () => {
      // Checking for transaction status
      if (initialEntry && isLocal(initialEntry)) {
        try {
          const entry = await bridgeApi.getPost(activeUser!.username, initialEntry.permlink);
          const isAlreadyAdded =
            initialEntry.permlink === entry?.permlink && !isLocal(initialEntry);
          if (entry && !isAlreadyAdded) {
            onSuccessCheck(entry);
          }
        } catch (e) {}
      }
    },
    intervalStarted ? 3000 : null
  );
}
