import { useContext, useEffect } from "react";
import { DeckGrid, OldDeck } from "./types";
import { DeckGridContext } from "./deck-manager";
import * as uuid from "uuid";
import { useGlobalStore } from "@/core/global-store";
import { get, set } from "@/utils/local-storage";
import i18next from "i18next";

export function useOldDeckMigration() {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { pushOrUpdateDeck } = useContext(DeckGridContext);

  useEffect(() => {
    if (activeUser && !get(`${activeUser.username}_dm`)) {
      const oldDecks: OldDeck[] | null = get(`user-${activeUser.username}-decks`);
      if (oldDecks) {
        const newDeck: DeckGrid = {
          title: `${activeUser.username}`,
          icon: undefined,
          key: uuid.v4(),
          storageType: "local",
          columns: []
        };
        oldDecks.forEach(({ header: { title, updateIntervalMs }, dataParams, dataFilters }) => {
          let [deckType, username] = title.split(" @");
          deckType = deckType.toLocaleLowerCase();

          const isCommunity = title.includes("hive-");
          const isPost =
            deckType === i18next.t("decks.posts").toLocaleLowerCase() ||
            deckType === i18next.t("decks.blogs").toLocaleLowerCase() ||
            deckType === i18next.t("decks.comments").toLocaleLowerCase() ||
            deckType === i18next.t("decks.replies").toLocaleLowerCase();

          if (deckType === i18next.t("decks.trending-topics").toLocaleLowerCase()) {
            newDeck.columns.push({
              key: newDeck.columns.length,
              type: "to",
              id: uuid.v4(),
              settings: {
                updateIntervalMs
              }
            });
          } else if (deckType === i18next.t("decks.trending").toLocaleLowerCase() && !isCommunity) {
            newDeck.columns.push({
              key: newDeck.columns.length,
              type: "tr",
              id: uuid.v4(),
              settings: {
                updateIntervalMs
              }
            });
          } else if (isCommunity) {
            const [contentType] = dataParams;
            newDeck.columns.push({
              key: newDeck.columns.length,
              type: "co",
              id: uuid.v4(),
              settings: {
                contentType,
                username,
                updateIntervalMs
              }
            });
          } else if (deckType === i18next.t("decks.notifications").toLocaleLowerCase()) {
            let contentType = "all";
            if (dataFilters && "type" in dataFilters) {
              contentType = dataFilters.type;
            }
            newDeck.columns.push({
              key: newDeck.columns.length,
              type: "n",
              id: uuid.v4(),
              settings: {
                contentType,
                username,
                updateIntervalMs
              }
            });
          } else if (deckType === i18next.t("decks.wallet").toLocaleLowerCase()) {
            let contentType = "all";
            if (dataFilters && "group" in dataFilters) {
              contentType = dataFilters.group;
            }
            newDeck.columns.push({
              key: newDeck.columns.length,
              type: "w",
              id: uuid.v4(),
              settings: {
                contentType,
                username,
                updateIntervalMs
              }
            });
          } else if (isPost) {
            const [contentType] = dataParams;
            newDeck.columns.push({
              key: newDeck.columns.length,
              type: "u",
              id: uuid.v4(),
              settings: {
                contentType,
                username,
                updateIntervalMs
              }
            });
          }
        });

        pushOrUpdateDeck(newDeck);
        set(`${activeUser.username}_dm`, true);
      }
    }
  }, [activeUser, pushOrUpdateDeck]);
}
