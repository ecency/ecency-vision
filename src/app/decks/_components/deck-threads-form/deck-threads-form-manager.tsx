import React, { createContext, useState } from "react";
import * as bridgeApi from "@/api/bridge";
import { useCommunityApi, useThreadsApi } from "./api";
import { ThreadItemEntry } from "../columns/deck-threads-manager";
import { Entry } from "@/entities";
import { ProfileFilter } from "@/enums";
import i18next from "i18next";
import { error } from "@/features/shared";
import { formatError } from "@/api/operations";

interface Context {
  show: boolean;
  setShow: (v: boolean) => void;
  create: (host: string, raw: string, entry?: ThreadItemEntry) => Promise<Entry>;
  createReply: (parent: Entry, raw: string, entry?: ThreadItemEntry) => Promise<Entry>;
}

export const DeckThreadsFormContext = createContext<Context>({
  show: false,
  setShow: () => {},
  create: async () => ({}) as Entry,
  createReply: async () => ({}) as Entry
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
        throw new Error(i18next.t("decks.threads-form.no-threads-host"));
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
