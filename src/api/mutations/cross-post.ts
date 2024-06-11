import { useMutation } from "@tanstack/react-query";
import { error, success } from "@/features/shared";
import { Entry } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { makeCrossPostMessage } from "@/utils/cross-post";
import { makeApp, makeCommentOptions } from "@/utils";
import pack from "../../../package.json";
import { comment, formatError } from "@/api/operations";
import i18next from "i18next";

export function useCrossPost(entry: Entry, onSuccess: () => void) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["crossPost"],
    mutationFn: async ({
      community,
      message
    }: {
      community: { id: string; name: string };
      message: string;
    }) => {
      if (!community || !activeUser) {
        return;
      }

      const { title } = entry;
      const author = activeUser.username;
      const permlink = `${entry.permlink}-${community.id}`;

      const body = makeCrossPostMessage(entry, author, message);
      const jsonMeta = {
        app: makeApp(pack.version),
        tags: ["cross-post"],
        original_author: entry.author,
        original_permlink: entry.permlink
      };

      const options = {
        ...makeCommentOptions(author, permlink, "dp"),
        allow_curation_rewards: false
      };

      return comment(author, "", community.id, permlink, title, body, jsonMeta, options);
    },
    onSuccess: () => {
      success(i18next.t("cross-post.published"));
      onSuccess();
    },
    onError: (e) => error(...formatError(e))
  });
}
