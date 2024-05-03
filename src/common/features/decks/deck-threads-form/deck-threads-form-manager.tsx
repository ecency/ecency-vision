import React, { createContext, useState } from "react";
import * as bridgeApi from "../../../api/bridge";
import { formatError } from "../../../api/operations";
import { Entry } from "../../../store/entries/types";
import { error } from "../../../components/feedback";
import { ProfileFilter } from "../../../store/global/types";
import { _t } from "../../../i18n";
import { useCommunityApi, useThreadsApi } from "./api";
import { ThreadItemEntry } from "../columns/deck-threads-manager";

interface Context {
  show: boolean;
  setShow: (v: boolean) => void;
  create: (host: string, raw: string, entry?: ThreadItemEntry) => Promise<Entry>;
  createReply: (parent: Entry, raw: string, entry?: ThreadItemEntry) => Promise<Entry>;
}

export const DeckThreadsFormContext = createContext<Context>({
  show: false,
  setShow: () => {},
  create: async () => ({} as Entry),
  createReply: async () => ({} as Entry)
});

interface Props {
  children: (context: Context) => JSX.Element | JSX.Element[];
}

export const DeckThreadsFormManager = ({ children }: Props) => {
  const { request: generalApiRequest } = useThreadsApi();
  const { request: communityBasedApiRequest } = useCommunityApi();

  const [show, setShow] = useState(false);

  const createThreadItem = async (host: string, raw: string, editingEntry?: ThreadItemEntry) => {
    try {
      if (host === "dbuzz") {
        return await communityBasedApiRequest(host, raw, editingEntry);
      }

      const hostEntries = await bridgeApi.getAccountPosts(ProfileFilter.posts, host);

      if (!hostEntries) {
        throw new Error(_t("decks.threads-form.no-threads-host"));
      }

      const entry = hostEntries[0];
      return await generalApiRequest(entry, raw, editingEntry);
    } catch (e) {
      error(...formatError(e));
      throw e;
    }
  };

  const replyToThreadItem = async (parent: Entry, raw: string, editingEntry?: ThreadItemEntry) => {
    try {
      return await generalApiRequest(parent, raw, editingEntry);
    } catch (e) {
      error(...formatError(e));
      throw e;
    }
  };

  return (
    <DeckThreadsFormContext.Provider
      value={{
        show,
        setShow,
        create: createThreadItem,
        createReply: replyToThreadItem
      }}
    >
      {children({
        show,
        setShow,
        create: createThreadItem,
        createReply: replyToThreadItem
      })}
    </DeckThreadsFormContext.Provider>
  );
};
