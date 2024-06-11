import { useMutation } from "@tanstack/react-query";
import { useGlobalStore } from "@/core/global-store";
import { EntryHeader } from "@/entities";
import { getPostHeader } from "@/api/bridge";
import { getPromotedPost } from "@/api/private-api";
import i18next from "i18next";

export function usePreCheckPromote(path: string, onSuccess: () => void) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return useMutation({
    mutationKey: ["preCheckPromote"],
    mutationFn: async () => {
      const [author, permlink] = path.replace("@", "").split("/");

      // Check if post is valid
      let post: EntryHeader | null;
      try {
        post = await getPostHeader(author, permlink);
      } catch (e) {
        post = null;
      }

      if (!post) {
        throw new Error(i18next.t("redeem-common.post-error"));
      }

      // Check if the post already promoted
      const promoted = await getPromotedPost(activeUser!.username, author, permlink);
      if (promoted) {
        throw new Error(i18next.t("redeem-common.post-promoted-exists"));
      }

      return;
    },
    onSuccess
  });
}
