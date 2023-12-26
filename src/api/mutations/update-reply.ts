import { useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import * as ss from "@/utils/session-storage";
import { useGlobalStore } from "@/core/global-store";
import { EntriesCacheContext } from "@/core/caches";
import { CommentOptions, Entry, MetaData } from "@/entities";
import { comment, formatError } from "@/api/operations";
import { error } from "@/features/shared";

export function useUpdateReply(entry: Entry | null, onSuccess?: () => void) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const { updateCache } = useContext(EntriesCacheContext);

  return useMutation({
    mutationKey: ["reply-update", activeUser?.username, entry?.author, entry?.permlink],
    mutationFn: async ({
      text,
      jsonMeta,
      options,
      point
    }: {
      text: string;
      jsonMeta: MetaData;
      point: boolean;
      options?: CommentOptions;
    }) => {
      if (!activeUser || !activeUser.data.__loaded || !entry) {
        throw new Error("[Reply][Create] – no active user provided");
      }

      await comment(
        activeUser.username,
        entry.parent_author ?? "",
        entry.parent_permlink ?? entry.category,
        entry.permlink,
        "",
        text,
        jsonMeta,
        options ?? null,
        point
      );
      return {
        ...entry,
        json_metadata: jsonMeta,
        body: text
      };
    },
    onSuccess: (data) => {
      if (!entry) {
        return;
      }

      updateCache([data]);

      // remove reply draft
      ss.remove(`reply_draft_${entry.author}_${entry.permlink}`);
      onSuccess?.();
    },
    onError: (e) => error(...formatError(e))
  });
}
