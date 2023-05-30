import {
  dismissNewVersion,
  hideIntro,
  muteNotifications,
  setCurrency,
  setLang,
  setLastIndexPath,
  setNsfw,
  toggleListStyle,
  toggleTheme,
  unMuteNotifications,
  setAccountEmail,
  setAccountName,
  setReferral
} from "./global";
import { fetchTrendingTags } from "./trending-tags";
import { updateSubscriptions } from "./subscriptions";
import { addEntry, fetchEntries, invalidateEntries, updateEntry } from "./entries";
import {
  addReply,
  deleteReply,
  fetchDiscussion,
  resetDiscussion,
  sortDiscussion,
  updateReply
} from "./discussion";
import { addAccount } from "./accounts";
import { addCommunity } from "./communities";
import { fetchTransactions, resetTransactions } from "./transactions";
import { addUser, deleteUser } from "./users";
import { setActiveUser, updateActiveUser } from "./active-user";
import { toggleUIProp } from "./ui";
import { addReblog, deleteReblog, fetchReblogs } from "./reblogs";
import {
  fetchNotifications,
  fetchNotificationsSettings,
  fetchUnreadNotificationCount,
  markNotifications,
  setNotificationsFilter,
  setNotificationsSettingsItem,
  updateNotificationsSettings
} from "./notifications";
import { fetchPoints, resetPoints } from "./points";
import { setSigningKey } from "./signing-key";
import { setEntryPin, trackEntryPin } from "./entry-pin-tracker";
import {
  createDeck,
  deleteDeck,
  fetchDeckData,
  loadDeckFromStorage,
  reorderDecks,
  setDeckDataFilters,
  setDeckUpdateInterval
} from "./deck";
import { savePageScroll } from "./persistent-page-scroll";

// @note Do not use it directly
export const ACTIONS = {
  toggleTheme,
  hideIntro,
  toggleListStyle,
  muteNotifications,
  unMuteNotifications,
  setCurrency,
  setLang,
  setNsfw,
  setLastIndexPath,
  dismissNewVersion,
  fetchTrendingTags,
  updateSubscriptions,
  fetchEntries,
  addEntry,
  updateEntry,
  invalidateEntries,
  fetchDiscussion,
  sortDiscussion,
  resetDiscussion,
  updateReply,
  addReply,
  deleteReply,
  addAccount,
  addCommunity,
  fetchTransactions,
  resetTransactions,
  addUser,
  deleteUser,
  setActiveUser,
  updateActiveUser,
  toggleUIProp,
  addReblog,
  deleteReblog,
  fetchReblogs,
  fetchNotifications,
  fetchUnreadNotificationCount,
  setNotificationsFilter,
  markNotifications,
  fetchPoints,
  resetPoints,
  setSigningKey,
  trackEntryPin,
  setEntryPin,
  createDeck,
  fetchDeckData,
  loadDeckFromStorage,
  deleteDeck,
  reorderDecks,
  savePageScroll,
  setDeckUpdateInterval,
  setDeckDataFilters,
  updateNotificationsSettings,
  fetchNotificationsSettings,
  setNotificationsSettingsItem,
  setAccountEmail,
  setAccountName,
  setReferral
};

export const getActions = () => ({
  ...ACTIONS
});
