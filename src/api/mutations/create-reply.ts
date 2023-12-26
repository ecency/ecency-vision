import { useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentOptions, Entry, FullAccount, MetaData } from "@/entities";
import { EntriesCacheContext } from "@/core/caches";
import { comment, formatError } from "../operations";
import { tempEntry } from "@/utils";
import { QueryIdentifiers } from "@/core/react-query";
import { error } from "@/features/shared";
import * as ss from "@/utils/session-storage";
import { useGlobalStore } from "@/core/global-store";

export function useCreateReply(entry: Entry | null, parent?: Entry, onSuccess?: () => void) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const { addReply, updateRepliesCount, updateCache } = useContext(EntriesCacheContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["reply-create", activeUser?.username, entry?.author, entry?.permlink],
    mutationFn: async ({
      permlink,
      text,
      jsonMeta,
      options,
      point
    }: {
      permlink: string;
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
        entry.author,
        entry.permlink,
        permlink,
        "",
        text,
        jsonMeta,
        options ?? null,
        point
      );
      return tempEntry({
        author: activeUser.data as FullAccount,
        permlink,
        parentAuthor: entry.author,
        parentPermlink: entry.permlink,
        title: "",
        body: text,
        tags: [],
        description: null
      });
    },
    onSuccess: (data) => {
      if (!entry) {
        return;
      }

      addReply(entry, data);
      updateCache([data]);

      // remove reply draft
      ss.remove(`reply_draft_${entry.author}_${entry.permlink}`);

      if (entry.children === 0) {
        // Update parent comment.
        updateRepliesCount(entry, 1);
      }
      const previousReplies =
        queryClient.getQueryData<Entry[]>([
          QueryIdentifiers.FETCH_DISCUSSIONS,
          parent?.author ?? entry.author,
          parent?.permlink ?? entry.permlink
        ]) ?? [];
      queryClient.setQueryData(
        [
          QueryIdentifiers.FETCH_DISCUSSIONS,
          parent?.author ?? entry.author,
          parent?.permlink ?? entry.permlink
        ],
        [data, ...previousReplies]
      );

      onSuccess?.();
    },
    onError: (e) => error(...formatError(e))
  });
}
