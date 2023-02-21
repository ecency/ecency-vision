import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { AppState } from "../store";

import { History, Location } from "history";
import { Global } from "../store/global/types";
import { User } from "../store/users/types";
import { Account, Accounts } from "../store/accounts/types";
import { Community, Communities } from "../store/communities/types";
import { TrendingTags } from "../store/trending-tags/types";
import { ActiveUser } from "../store/active-user/types";
import { ToggleType, UI } from "../store/ui/types";
import { NotificationFilter, Notifications } from "../store/notifications/types";
import { Subscription } from "../store/subscriptions/types";
import { DynamicProps } from "../store/dynamic-props/types";
import { Entries, Entry } from "../store/entries/types";
import { Reblogs } from "../store/reblogs/types";
import { Discussion as DiscussionType, SortOrder } from "../store/discussion/types";
import { Transactions, OperationGroup } from "../store/transactions/types";
import { Points } from "../store/points/types";
import { EntryPinTracker } from "../store/entry-pin-tracker/types";

import {
  updateNotificationsSettings,
  fetchNotificationsSettings,
  setNotificationsSettingsItem
} from "../store/notifications";
import {
  createDeck,
  deleteDeck,
  fetchDeckData,
  loadDeckFromStorage,
  reorderDecks
} from "../store/deck";
import { savePageScroll } from "../store/persistent-page-scroll";
import { getActions } from "../store/actions";

export interface PageProps {
  history: History;
  location: Location;

  global: Global;
  toggleTheme: () => void;
  hideIntro: () => void;
  toggleListStyle: (view: string | null) => void;
  dismissNewVersion: () => void;
  muteNotifications: () => void;
  unMuteNotifications: () => void;
  setCurrency: (currency: string, rate: number, symbol: string) => void;
  setLang: (lang: string) => void;
  setNsfw: (value: boolean) => void;
  setLastIndexPath: (path: string | null) => void;

  dynamicProps: DynamicProps;

  trendingTags: TrendingTags;
  fetchTrendingTags: () => void;

  subscriptions: Subscription[];
  updateSubscriptions: (list: Subscription[]) => void;

  entries: Entries;
  fetchEntries: (what: string, tag: string, more: boolean) => void;
  addEntry: (entry: Entry) => void;
  updateEntry: (entry: Entry) => void;
  invalidateEntries: (groupKey: string) => void;

  discussion: DiscussionType;
  fetchDiscussion: (parent_author: string, parent_permlink: string) => void;
  sortDiscussion: (order: SortOrder) => void;
  resetDiscussion: () => void;
  updateReply: (reply: Entry) => void;
  addReply: (reply: Entry) => void;
  deleteReply: (reply: Entry) => void;

  accounts: Accounts;
  addAccount: (data: Account) => void;

  communities: Communities;
  addCommunity: (data: Community) => void;

  transactions: Transactions;
  fetchTransactions: (
    username: string,
    group?: OperationGroup | "",
    start?: number,
    limit?: number
  ) => void;
  resetTransactions: () => void;

  users: User[];
  addUser: (user: User) => void;
  deleteUser: (username: string) => void;

  activeUser: ActiveUser | null;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;

  ui: UI;
  toggleUIProp: (what: ToggleType) => void;

  reblogs: Reblogs;
  fetchReblogs: () => void;
  addReblog: (author: string, permlink: string) => void;
  deleteReblog: (author: string, permlink: string) => void;

  notifications: Notifications;
  fetchNotifications: (since: string | null) => void;
  fetchUnreadNotificationCount: () => void;
  setNotificationsFilter: (filter: NotificationFilter | null) => void;
  markNotifications: (id: string | null) => void;
  updateNotificationsSettings: typeof updateNotificationsSettings;
  fetchNotificationsSettings: typeof fetchNotificationsSettings;
  setNotificationsSettingsItem: typeof setNotificationsSettingsItem;

  points: Points;
  fetchPoints: (username: string, filter?: number) => void;
  resetPoints: () => void;

  signingKey: string;
  setSigningKey: (key: string) => void;

  deck: any;
  persistentPageScroll: any;
  entryPinTracker: EntryPinTracker;
  trackEntryPin: (entry: Entry) => void;
  setEntryPin: (entry: Entry, pin: boolean) => void;
  createDeck: typeof createDeck;
  fetchDeckData: typeof fetchDeckData;
  loadDeckFromStorage: typeof loadDeckFromStorage;
  deleteDeck: typeof deleteDeck;
  reorderDecks: typeof reorderDecks;
  savePageScroll: typeof savePageScroll;
}

export const pageMapStateToProps = (state: AppState) => ({
  ...state
});

export const pageMapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(getActions(), dispatch);
