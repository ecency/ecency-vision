import { PostBase } from "../_types";
import { useEntryTypeDetection } from "./entry-type-detection";
import useLocalStorage from "react-use/lib/useLocalStorage";
import useMount from "react-use/lib/useMount";
import { PREFIX } from "@/utils/local-storage";

export function useLocalDraftManager(
  path: string,
  username: string | undefined,
  permlink: string | undefined,
  draftId: string | undefined,
  setIsDraftEmpty: (v: boolean) => void,
  onDraftLoaded: (title: string, tags: string[], body: string) => void
) {
  const [localDraft, setLocalDraft] = useLocalStorage<PostBase>(PREFIX + "_local_draft");

  const { isEntry, isDraft } = useEntryTypeDetection(path, username, permlink, draftId);

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
      if (
        localDraft &&
        localDraft[key as keyof PostBase] &&
        (localDraft[key as keyof PostBase]?.length ?? 0) > 0
      ) {
        setIsDraftEmpty(false);
      }
    }
  });

  return {
    localDraft,
    setLocalDraft
  };
}
