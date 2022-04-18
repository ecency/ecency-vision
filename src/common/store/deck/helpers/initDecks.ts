import { communities, globalTrending, hot, notificationSvg, person, wallet } from '../../../img/svg';
import { HotListItem, SearchListItem } from '../../../components/deck/deck-items';
import { _t } from '../../../i18n';
import { NotificationListItem } from '../../../components/notifications';
import { TransactionRow } from '../../../components/transactions';
import { DeckModel, SerializedDeckModel } from '../types';

export const initDecks = (data: SerializedDeckModel[]) => data.map((item): DeckModel => {
  let icon = person; // Handle conditional icons and listItemComponent
  let listItemComponent: any = SearchListItem; // Handle conditional icons and listItemComponent
  let title = item.header.title.toLowerCase();
  if (title.includes(_t('decks.trending-topics').toLowerCase())) {
    icon = hot;
    listItemComponent = HotListItem;
  } else if (title.includes(_t('decks.trending').toLowerCase())) {
    icon = globalTrending;
    listItemComponent = SearchListItem;
  } else if (title.includes('hive-')) {
    icon = communities;
    listItemComponent = SearchListItem;
  } else if (
    title.includes(_t('decks.notifications').toLowerCase())
  ) {
    icon = notificationSvg;
    listItemComponent = NotificationListItem;
  } else if (title.includes(_t('decks.wallet').toLowerCase())) {
    icon = wallet;
    listItemComponent = TransactionRow;
  }
  return {
    ...item,
    listItemComponent,
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    header: {
      ...item.header,
      updateIntervalMs: item.header.updateIntervalMs || 60000,
      icon,
      reloading: false,
    },
  };
});
