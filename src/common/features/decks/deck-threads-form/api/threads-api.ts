import { Entry } from "../../../../store/entries/types";
import { createReplyPermlink, makeJsonMetaDataReply } from "../../../../helper/posting";
import { comment } from "../../../../api/operations";
import tempEntry from "../../../../helper/temp-entry";
import { FullAccount } from "../../../../store/accounts/types";
import { version } from "../../../../../../package.json";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { v4 } from "uuid";
import { ThreadItemEntry } from "../../columns/deck-threads-manager";
import { useContext } from "react";
import { EntriesCacheContext } from "../../../../core";

export function useThreadsApi() {
  const { activeUser } = useMappedStore();
  const { addReply, updateRepliesCount } = useContext(EntriesCacheContext);

  const request = async (entry: Entry, raw: string, editingEntry?: ThreadItemEntry) => {
    if (!activeUser || !activeUser.data.__loaded) {
      throw new Error("No user");
    }

    const { author: parentAuthor, permlink: parentPermlink } = editingEntry?.container ?? entry;
    const author = activeUser.username;
    const permlink = editingEntry?.permlink ?? createReplyPermlink(entry.author);
    const tags = raw.match(/\#[a-zA-Z0-9]+/g)?.map((tag) => tag.replace("#", "")) ?? ["ecency"];

    const jsonMeta = makeJsonMetaDataReply(tags, version);

    await comment(author, parentAuthor, parentPermlink, permlink, "", raw, jsonMeta, null, true);

    const nReply = tempEntry({
      author: activeUser.data as FullAccount,
      permlink,
      parentAuthor,
      parentPermlink,
      title: "",
      body: raw,
      tags,
      description: null,
      post_id: v4()
    });

    // add new reply to store
    addReply(entry, nReply);

    if (entry.children === 0) {
      // Activate discussion section with first comment.
      const nEntry: Entry = {
        ...entry,
        children: 1
      };
      updateRepliesCount(entry, 1);
    }

    return nReply;
  };

  return { request };
}
