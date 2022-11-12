import { CreateAction, DeckState, IdentifiableDeckModel } from "../types";
import { _t } from "../../../i18n";

export function createDeckReducer(state: DeckState, data: CreateAction["data"]): DeckState {
  const [listItemComponent, title, icon, dataParams, createdAt, updateIntervalMs, dataFilters] =
    data;
  const id = `item-${state.items.length}`;
  let newDataFilters = dataFilters;

  if (!newDataFilters) {
    const isWalletType = title.toLocaleLowerCase().includes(_t("decks.wallet").toLocaleLowerCase());
    const isNotificationsType = title
      .toLocaleLowerCase()
      .includes(_t("decks.notifications").toLocaleLowerCase());
    if (isWalletType) {
      newDataFilters = { group: "" };
    } else if (isNotificationsType) {
      newDataFilters = { type: "" };
    }
  }

  const deck: IdentifiableDeckModel = {
    listItemComponent,
    dataFilters: newDataFilters,
    header: {
      title,
      icon,
      reloading: false,
      updateIntervalMs: updateIntervalMs || 60000
    },
    dataParams,
    id,
    content: id,
    createdAt: createdAt || new Date()
  };

  return {
    ...state,
    items: [...state.items, deck]
  };
}
