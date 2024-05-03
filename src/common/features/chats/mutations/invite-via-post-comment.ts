import { useMutation } from "@tanstack/react-query";
import { comment } from "../../../api/operations";
import tempEntry from "../../../helper/temp-entry";
import { FullAccount } from "../../../store/accounts/types";
import { createReplyPermlink } from "../../../helper/posting";
import { useMappedStore } from "../../../store/use-mapped-store";
import { error } from "../../../components/feedback";
import { _t } from "../../../i18n";
import { useCreateReply } from "../../../api/mutations";
import { useGetAccountPostsQuery } from "../../../api/queries";

export function useInviteViaPostComment(username: string) {
  const { activeUser } = useMappedStore();
  const { data: posts } = useGetAccountPostsQuery(username);
  const { mutateAsync: addReply } = useCreateReply(posts[0]);

  return useMutation(["chats/invite-via-post-comment"], async (text: string) => {
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
      error(_t("chat.no-posts-for-invite"));
      throw new Error(_t("chat.no-posts-for-invite"));
    }
  });
}
