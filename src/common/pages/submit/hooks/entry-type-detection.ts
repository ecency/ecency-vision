import { useEffect, useState } from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { MatchType } from "../types";

export function useEntryTypeDetection(match: MatchType) {
  const { activeUser } = useMappedStore();

  const [isEntry, setIsEntry] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    setIsDraft(isDraftFn());
    setIsEntry(isEntryFn());
  }, [match, activeUser]);

  const isEntryFn = () => {
    const { path, params } = match;

    return !!(activeUser && path.endsWith("/edit") && params.username && params.permlink);
  };

  const isDraftFn = () => {
    const { path, params } = match;

    return !!(activeUser && path.startsWith("/draft") && params.draftId);
  };

  return { isEntry, isDraft };
}
