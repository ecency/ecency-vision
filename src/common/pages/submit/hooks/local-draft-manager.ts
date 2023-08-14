import { PREFIX } from "../../../util/local-storage";
import { MatchType, PostBase } from "../types";
import { useEntryTypeDetection } from "./entry-type-detection";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { useState } from "react";
import useMount from "react-use/lib/useMount";

export function useLocalDraftManager(
  match: MatchType,
  onDraftLoaded: (title: string, tags: string[], body: string) => void
) {
  const [localDraft, setLocalDraft] = useLocalStorage<PostBase>(PREFIX + "local_draft");
  const [isDraftEmpty, setIsDraftEmpty] = useState(false);

  const { isEntry, isDraft } = useEntryTypeDetection(match);

  useMount(() => {
    if (isEntry || isDraft) {
      return;
    }

    if (!localDraft || JSON.stringify(localDraft) === "{}") {
      setIsDraftEmpty(true);
      return;
    }

    const { title, tags, body } = localDraft;
    onDraftLoaded(title, tags, body);

    for (const key in localDraft) {
      if (localDraft && localDraft[key] && localDraft[key].length > 0) {
        setIsDraftEmpty(false);
      }
    }
  });

  return {
    isDraftEmpty,
    setIsDraftEmpty,
    setLocalDraft
  };
}
