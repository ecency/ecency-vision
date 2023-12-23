import { Entry } from "../../store/entries/types";
import { useMappedStore } from "../../store/use-mapped-store";
import { useContext } from "react";
import { EntriesCacheContext, QueryIdentifiers } from "../../core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { comment, CommentOptions, formatError, MetaData } from "../operations";
import tempEntry from "../../helper/temp-entry";
import { FullAccount } from "../../store/accounts/types";
import * as ss from "../../util/session-storage";
import { error } from "../../components/feedback";

export function useCreateReply(entry: Entry, parent?: Entry, onSuccess?: () => void) {
  const { activeUser } = useMappedStore();
  const { addReply, updateRepliesCount, updateCache } = useContext(EntriesCacheContext);
  const queryClient = useQueryClient();

  return useMutation(
    ["reply-create", activeUser?.username, entry.author, entry.permlink],
    async ({
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
      if (!activeUser || !activeUser.data.__loaded) {
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
    {
      onSuccess: (data) => {
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
    }
  );
}
