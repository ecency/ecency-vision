import { useMutation } from "@tanstack/react-query";
import { Entry } from "@/entities";
import { broadcastPostingJSON, formatError } from "@/api/operations";
import { useGlobalStore } from "@/core/global-store";
import { useRecordUserActivity } from "@/api/mutations/record-user-activity";
import { error, info, success } from "@/features/shared";
import i18next from "i18next";

export function useEntryReblog(entry: Entry) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { mutateAsync: recordUserActivity } = useRecordUserActivity();

  return useMutation({
    mutationKey: ["entryReblog", activeUser?.username, entry.author, entry.permlink],
    mutationFn: async ({ isDelete }: { isDelete: boolean }) => {
      const username = activeUser!.username;
      const message: Record<string, any> = {
        account: username,
        author: entry.author,
        permlink: entry.permlink
      };

      if (isDelete) {
        message["delete"] = "delete";
      }

      const json = ["reblog", message];
      const r = await broadcastPostingJSON(username, "follow", json);
      await recordUserActivity({ ty: 130, bl: r.block_num, tx: r.id });
      return [r, isDelete];
    },
    onSuccess: ([_, isDelete]) =>
      isDelete
        ? info(i18next.t("entry-reblog.delete-success"))
        : success(i18next.t("entry-reblog.success")),
    onError: (e) => error(...formatError(e))
  });
}
