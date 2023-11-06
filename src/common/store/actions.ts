import {
  dismissNewVersion,
  hideIntro,
  muteNotifications,
  newVersionChangeAct,
  setCurrency,
  setLang,
  setLastIndexPath,
  setNsfw,
  toggleListStyle,
  toggleTheme,
  unMuteNotifications
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
import { setSigningKey } from "./signing-key";
import {
  addDirectMessages,
  addleftChannels,
  addPreviousPublicMessages,
  addProfile,
  addPublicMessage,
  deleteDirectMessage,
  deletePublicMessage,
  replaceDirectMessage,
  replacePublicMessage,
  resetChat,
  UpdateChannels,
  verifyDirectMessageSending,
  verifyPublicMessageSending
} from "./chat";

// @note Do not use it directly
export const ACTIONS = {
  toggleTheme,
  newVersionChangeAct,
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
  setSigningKey,
  updateNotificationsSettings,
  fetchNotificationsSettings,
  setNotificationsSettingsItem,
  addDirectMessages,
  resetChat,
  addPublicMessage,
  addProfile,
  addleftChannels,
  UpdateChannels,
  replacePublicMessage,
  verifyPublicMessageSending,
  replaceDirectMessage,
  verifyDirectMessageSending,
  deletePublicMessage,
  deleteDirectMessage,
  addPreviousPublicMessages
};

export const getActions = () => ({
  ...ACTIONS
});
