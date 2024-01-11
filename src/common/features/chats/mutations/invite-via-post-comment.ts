import { useMutation } from "@tanstack/react-query";
import { getAccountPosts } from "../../../api/bridge";
import { comment } from "../../../api/operations";
import tempEntry from "../../../helper/temp-entry";
import { FullAccount } from "../../../store/accounts/types";
import { createReplyPermlink } from "../../../helper/posting";
import { useMappedStore } from "../../../store/use-mapped-store";
import { error } from "../../../components/feedback";
import { _t } from "../../../i18n";

export function useInviteViaPostComment(username: string) {
  const { activeUser, addReply } = useMappedStore();

  return useMutation(["chats/invite-via-post-comment"], async (text: string) => {
    const response = await getAccountPosts("posts", username);
    if (response && response.length > 0) {
      const firstPost = response[0];

      const { author: parentAuthor, permlink: parentPermlink } = firstPost;
      const author = activeUser!!.username;
      const permlink = createReplyPermlink(author);
      await comment(author, parentAuthor, parentPermlink, permlink, "", text, {}, null, true);
      addReply(
        tempEntry({
          author: activeUser!!.data as FullAccount,
          permlink,
          parentAuthor,
          parentPermlink,
          title: "",
          body: text,
          tags: [],
          description: null
        })
      );
    } else {
      error(_t("chat.no-posts-for-invite"));
      throw new Error(_t("chat.no-posts-for-invite"));
    }
  });
}
