import { useMutation } from "@tanstack/react-query";
import { broadcastPostingOperations, formatError } from "@/api/operations";
import { useGlobalStore } from "@/core/global-store";
import { Entry } from "@/entities";
import { error } from "@/features/shared";
import { Operation } from "@hiveio/dhive";
import { getQueryClient, QueryIdentifiers } from "@/core/react-query";

export function useDeleteComment(entry: Entry, onSuccess: () => void, parent?: Entry) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["deleteComment", activeUser?.username, entry?.id],
    mutationFn: () => {
      if (!activeUser) {
        throw new Error("Active user not found");
      }

      const params = {
        author: entry.author,
        permlink: entry.permlink
      };

      const opArray: Operation[] = [["delete_comment", params]];

      return broadcastPostingOperations(activeUser.username, opArray);
    },
    onError: (err) => error(...formatError(err)),
    onSuccess: () => {
      if (parent) {
        const previousReplies =
          getQueryClient().getQueryData<Entry[]>([
            QueryIdentifiers.FETCH_DISCUSSIONS,
            parent?.author,
            parent?.permlink
          ]) ?? [];
        getQueryClient().setQueryData(
          [QueryIdentifiers.FETCH_DISCUSSIONS, parent?.author, parent?.permlink],
          [
            ...previousReplies.filter(
              (r) => r.author !== entry.author || r.permlink !== entry.permlink
            )
          ]
        );
      }

      onSuccess();
    }
  });
}
