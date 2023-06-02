import { Entry } from "../../../../store/entries/types";
import { createReplyPermlink, makeJsonMetaDataReply } from "../../../../helper/posting";
import { comment } from "../../../../api/operations";
import tempEntry from "../../../../helper/temp-entry";
import { FullAccount } from "../../../../store/accounts/types";
import { version } from "../../../../../../package.json";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { v4 } from "uuid";
import { ThreadItemEntry } from "../../columns/deck-threads-manager";

export function useThreadsApi() {
  const { activeUser, addReply, updateEntry } = useMappedStore();

  const request = async (entry: Entry, raw: string, editingEntry?: ThreadItemEntry) => {
    if (!activeUser || !activeUser.data.__loaded) {
      throw new Error("No user");
    }

    const { author: parentAuthor, permlink: parentPermlink } = editingEntry?.container ?? entry;
    const author = activeUser.username;
    const permlink = editingEntry?.permlink ?? createReplyPermlink(entry.author);
    const tags = editingEntry?.json_metadata.tags || ["ecency"];

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
    addReply(nReply);

    if (entry.children === 0) {
      // Activate discussion section with first comment.
      const nEntry: Entry = {
        ...entry,
        children: 1
      };

      updateEntry(nEntry);
    }

    return nReply;
  };

  return { request };
}
