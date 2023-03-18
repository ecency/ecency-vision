import {
  communities,
  globalTrending,
  hot,
  notificationSvg,
  person,
  wallet
} from "../../../img/svg";
import { _t } from "../../../i18n";
import { DeckModel, SerializedDeckModel } from "../types";

export const initDecks = (data: SerializedDeckModel[], listItems: Record<string, any>) =>
  data.map((item): DeckModel => {
    let icon = person; // Handle conditional icons and listItemComponent
    let listItemComponent: any = listItems.SearchListItem; // Handle conditional icons and listItemComponent
    let title = item.header.title.toLowerCase();
    let dataFilters = item?.dataFilters || null;
    if (title.includes(_t("decks.trending-topics").toLowerCase())) {
      icon = hot;
      listItemComponent = listItems.HotListItem;
    } else if (title.includes(_t("decks.trending").toLowerCase())) {
      icon = globalTrending;
      listItemComponent = listItems.SearchListItem;
    } else if (title.includes("hive-")) {
      icon = communities;
      listItemComponent = listItems.SearchListItem;
    } else if (title.includes(_t("decks.notifications").toLowerCase())) {
      icon = notificationSvg;
      listItemComponent = listItems.NotificationListItem;
      if (!dataFilters) {
        dataFilters = {
          type: ""
        };
      }
    } else if (title.includes(_t("decks.wallet").toLowerCase())) {
      icon = wallet;
      listItemComponent = listItems.TransactionRow;
      if (!dataFilters) {
        dataFilters = {
          group: ""
        };
      }
    }
    return {
      ...item,
      listItemComponent,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      dataFilters,
      header: {
        ...item.header,
        updateIntervalMs: item.header.updateIntervalMs || 60000,
        icon,
        reloading: false
      }
    };
  });
