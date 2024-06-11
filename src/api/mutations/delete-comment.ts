import { useMutation } from "@tanstack/react-query";
import { deleteComment, formatError } from "@/api/operations";
import { useGlobalStore } from "@/core/global-store";
import { Entry } from "@/entities";
import { error } from "@/features/shared";

export function useDeleteComment(entry: Entry, onSuccess: () => void) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["deleteComment", activeUser?.username, entry?.id],
    mutationFn: () => deleteComment(activeUser!.username, entry.author, entry.permlink),
    onError: (err) => error(...formatError(err)),
    onSuccess
  });
}
