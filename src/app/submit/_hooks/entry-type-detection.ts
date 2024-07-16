import { useCallback, useEffect, useState } from "react";
import { useGlobalStore } from "@/core/global-store";

export function useEntryTypeDetection(
  path: string,
  username: string | undefined,
  permlink: string | undefined,
  draftId: string | undefined
) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [isEntry, setIsEntry] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const isEntryFn = useCallback(() => {
    return !!(activeUser && path.endsWith("/edit") && username && permlink);
  }, [activeUser, path, permlink, username]);

  const isDraftFn = useCallback(() => {
    return !!(activeUser && path.startsWith("/draft") && draftId);
  }, [activeUser, draftId, path]);

  useEffect(() => {
    setIsDraft(isDraftFn());
    setIsEntry(isEntryFn());
  }, [activeUser, isDraftFn, isEntryFn]);

  return { isEntry, isDraft };
}
