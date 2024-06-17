import { useMutation } from "@tanstack/react-query";
import { useGlobalStore } from "@/core/global-store";
import { getAccountPostsQuery } from "@/api/queries";
import { useCreateReply } from "@/api/mutations";
import { createReplyPermlink, tempEntry } from "@/utils";
import { comment } from "@/api/operations";
import { FullAccount } from "@/entities";
import { error } from "@/features/shared";
import i18next from "i18next";
import { useMemo } from "react";

export function useInviteViaPostComment(username: string) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const { data } = getAccountPostsQuery(username).useClientQuery();

  const posts = useMemo(() => data?.pages[0] ?? [], [data]);

  const { mutateAsync: addReply } = useCreateReply(posts[0]);

  return useMutation({
    mutationKey: ["chats/invite-via-post-comment"],
    mutationFn: async (text: string) => {
      if (posts[0]) {
        const { author: parentAuthor, permlink: parentPermlink } = posts[0];
        const author = activeUser!!.username;
        const permlink = createReplyPermlink(author);
        await comment(author, parentAuthor, parentPermlink, permlink, "", text, {}, null, true);
        return addReply(
          tempEntry({
            author: activeUser!!.data as FullAccount,
            permlink,
            parentAuthor,
            parentPermlink,
            title: "",
            body: text,
            tags: [],
            description: null
          }) as any
        );
      } else {
        error(i18next.t("chat.no-posts-for-invite"));
        throw new Error(i18next.t("chat.no-posts-for-invite"));
      }
    }
  });
}
