import React, { createContext, useState } from "react";
import * as bridgeApi from "../../../api/bridge";
import { createReplyPermlink, makeJsonMetaDataReply } from "../../../helper/posting";
import { comment, formatError } from "../../../api/operations";
import tempEntry from "../../../helper/temp-entry";
import { FullAccount } from "../../../store/accounts/types";
import { Entry } from "../../../store/entries/types";
import { error } from "../../feedback";
import { useMappedStore } from "../../../store/use-mapped-store";
import { ProfileFilter } from "../../../store/global/types";
import { _t } from "../../../i18n";
import { version } from "../../../../../package.json";

interface Context {
  show: boolean;
  setShow: (v: boolean) => void;
  create: (host: string, raw: string) => Promise<Entry>;
}

export const DeckThreadsFormContext = createContext<Context>({
  show: false,
  setShow: () => {},
  create: async () => ({} as Entry)
});

interface Props {
  children: (context: Context) => JSX.Element | JSX.Element[];
}

export const DeckThreadsFormManager = ({ children }: Props) => {
  const { activeUser, addReply, updateEntry } = useMappedStore();

  const [show, setShow] = useState(false);

  const createThreadItem = async (host: string, raw: string) => {
    if (!activeUser || !activeUser.data.__loaded) {
      throw new Error("No user");
    }

    try {
      const hostEntries = await bridgeApi.getAccountPosts(ProfileFilter.posts, host);

      if (!hostEntries) {
        throw new Error(_t("decks.threads-form.no-threads-host"));
      }

      const entry = hostEntries[0];

      const { author: parentAuthor, permlink: parentPermlink } = entry;
      const author = activeUser.username;
      const permlink = createReplyPermlink(entry.author);
      const tags = entry.json_metadata.tags || ["ecency"];

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
        description: null
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
    } catch (e) {
      error(...formatError(e));
      throw e;
    }
  };

  return (
    <DeckThreadsFormContext.Provider value={{ show, setShow, create: createThreadItem }}>
      {children({ show, setShow, create: createThreadItem })}
    </DeckThreadsFormContext.Provider>
  );
};
