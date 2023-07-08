import { useMappedStore } from "../../store/use-mapped-store";
import { useContext, useEffect } from "react";
import { get, set } from "../../util/local-storage";
import { DeckGrid, OldDeck } from "./types";
import { DeckGridContext } from "./deck-manager";
import * as uuid from "uuid";
import { _t } from "../../i18n";

export function useOldDeckMigration() {
  const { activeUser } = useMappedStore();
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
            deckType === _t("decks.posts").toLocaleLowerCase() ||
            deckType === _t("decks.blogs").toLocaleLowerCase() ||
            deckType === _t("decks.comments").toLocaleLowerCase() ||
            deckType === _t("decks.replies").toLocaleLowerCase();

          if (deckType === _t("decks.trending-topics").toLocaleLowerCase()) {
            newDeck.columns.push({
              key: newDeck.columns.length,
              type: "to",
              id: uuid.v4(),
              settings: {
                updateIntervalMs
              }
            });
          } else if (deckType === _t("decks.trending").toLocaleLowerCase() && !isCommunity) {
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
          } else if (deckType === _t("decks.notifications").toLocaleLowerCase()) {
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
          } else if (deckType === _t("decks.wallet").toLocaleLowerCase()) {
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
  }, [activeUser]);
}
