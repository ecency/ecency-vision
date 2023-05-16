import React, { createContext, useState } from "react";
import * as bridgeApi from "../../../api/bridge";
import { formatError } from "../../../api/operations";
import { Entry } from "../../../store/entries/types";
import { error } from "../../feedback";
import { ProfileFilter } from "../../../store/global/types";
import { _t } from "../../../i18n";
import { useCommunityApi, useThreadsApi } from "./api";

interface Context {
  show: boolean;
  setShow: (v: boolean) => void;
  create: (host: string, raw: string) => Promise<Entry>;
  createReply: (parent: Entry, raw: string) => Promise<Entry>;
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

  const createThreadItem = async (host: string, raw: string) => {
    try {
      if (host === "dbuzz") {
        return await communityBasedApiRequest(host, raw);
      }

      const hostEntries = await bridgeApi.getAccountPosts(ProfileFilter.posts, host);

      if (!hostEntries) {
        throw new Error(_t("decks.threads-form.no-threads-host"));
      }

      const entry = hostEntries[0];
      return await generalApiRequest(entry, raw);
    } catch (e) {
      error(...formatError(e));
      throw e;
    }
  };

  const replyToThreadItem = async (parent: Entry, raw: string) => {
    try {
      return await generalApiRequest(parent, raw);
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
