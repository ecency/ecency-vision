import { Entry } from "../../store/entries/types";
import { useMappedStore } from "../../store/use-mapped-store";
import { useContext } from "react";
import { EntriesCacheContext } from "../../core";
import { useMutation } from "@tanstack/react-query";
import { comment, CommentOptions, formatError, MetaData } from "../operations";
import * as ss from "../../util/session-storage";
import { error } from "../../components/feedback";

export function useUpdateReply(entry: Entry | null, onSuccess?: () => void) {
  const { activeUser } = useMappedStore();
  const { updateCache } = useContext(EntriesCacheContext);

  return useMutation(
    ["reply-update", activeUser?.username, entry?.author, entry?.permlink],
    async ({
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
    {
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
    }
  );
}
