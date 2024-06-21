import { v4 } from "uuid";
import { ThreadItemEntry } from "../../columns/deck-threads-manager";
import { useContext } from "react";
import { useGlobalStore } from "@/core/global-store";
import { EntriesCacheContext } from "@/core/caches";
import { PollsContext } from "@/features/polls";
import { Entry, FullAccount } from "@/entities";
import { createReplyPermlink, tempEntry } from "@/utils";
import { EntryMetadataManagement } from "@/features/entry-management";
import { comment } from "@/api/operations";

export function useThreadsApi() {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { addReply, updateRepliesCount } = useContext(EntriesCacheContext);
  const { activePoll } = useContext(PollsContext);

  const request = async (entry: Entry, raw: string, editingEntry?: ThreadItemEntry) => {
    if (!activeUser || !activeUser.data.__loaded) {
      throw new Error("No user");
    }

    const { author: parentAuthor, permlink: parentPermlink } = editingEntry?.container ?? entry;
    const author = activeUser.username;
    const permlink = editingEntry?.permlink ?? createReplyPermlink(entry.author);
    const tags = raw.match(/\#[a-zA-Z0-9]+/g)?.map((tag) => tag.replace("#", "")) ?? ["ecency"];

    const jsonMeta = EntryMetadataManagement.EntryMetadataManager.shared
      .builder()
      .default()
      .withTags(tags)
      .withPoll(activePoll)
      .build();

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
