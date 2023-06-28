import { AppState } from "./index";

import { initialState as globalInitialState } from "./global";
import { initialState as dynamicPropsInitialState } from "./dynamic-props";
import { initialState as trendingTagsInitialState } from "./trending-tags";
import { initialState as accountsInitialState } from "./accounts";
import { initialState as transactionsInitialState } from "./transactions";
import { initialState as usersInitialState } from "./users";
import { initialState as activeUserInitialState } from "./active-user";
import { initialState as reblogsInitialState } from "./reblogs";
import { initialState as discussionInitialState } from "./discussion";
import { initialState as uiInitialState } from "./ui";
import { initialState as subscriptionsInitialState } from "./subscriptions";
import { initialState as notificationsInitialState } from "./notifications";
import { initialState as entriesInitialState } from "./entries";
import { initialState as pointsInitialState } from "./points";
import { initialState as signingKeyInitialState } from "./signing-key";
import { initialState as persistentPageScrollInitialState } from "./persistent-page-scroll";

const initialState: AppState = {
  global: globalInitialState,
  dynamicProps: dynamicPropsInitialState,
  trendingTags: trendingTagsInitialState,
  accounts: accountsInitialState,
  transactions: transactionsInitialState,
  users: usersInitialState,
  activeUser: activeUserInitialState,
  reblogs: reblogsInitialState,
  discussion: discussionInitialState,
  ui: uiInitialState,
  subscriptions: subscriptionsInitialState,
  notifications: notificationsInitialState,
  entries: entriesInitialState,
  points: pointsInitialState,
  signingKey: signingKeyInitialState,
  persistentPageScroll: persistentPageScrollInitialState
};

export default initialState;
