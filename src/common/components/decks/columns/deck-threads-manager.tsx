import { Entry } from "../../../store/entries/types";
import { createContext } from "react";
import React from "react";
import { AVAILABLE_THREAD_HOSTS } from "../consts";
import * as hive from "../../../api/hive";
import * as bridgeApi from "../../../api/bridge";
import { ProfileFilter } from "../../../store/global/types";
import { error } from "../../feedback";
import { _t } from "../../../i18n";
import moment from "moment";

interface Context {
  fetch: (host: string) => Promise<Entry[]>;
}

export const DeckThreadsContext = createContext<Context>({
  fetch: async () => []
});

export const DeckThreadsManager = ({ children }: { children: JSX.Element }) => {
  /**
   *
   * @param host Thread host username
   * @param lastContainer Last thread container post
   */
  const fetch = async (host: string, lastContainer?: Entry) => {
    const fetchingHosts = AVAILABLE_THREAD_HOSTS.filter((h) =>
      host === "all" ? true : h === host
    );
    let nextThreadItems: Entry[] = [];

    for (const host of fetchingHosts) {
      const nextThreadContainers = await bridgeApi.getAccountPosts(
        ProfileFilter.posts,
        host,
        lastContainer?.author,
        lastContainer?.permlink,
        1
      );

      if (!nextThreadContainers || nextThreadContainers.length === 0) {
        error(_t("decks.threads-form.no-threads-host"));
        return [];
      }

      const threadItems =
        (await hive.getContentReplies(host, nextThreadContainers[0].permlink)) ?? [];

      nextThreadItems = [...nextThreadItems, ...threadItems];
    }

    nextThreadItems = nextThreadItems.sort((a, b) => {
      return moment(a.created).isAfter(b.created) ? -1 : 1;
    });

    return nextThreadItems;
  };

  return <DeckThreadsContext.Provider value={{ fetch }}>{children}</DeckThreadsContext.Provider>;
};
