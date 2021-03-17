import {AnyAction, bindActionCreators, Dispatch} from "redux";
import {AppState} from "../store";

import {History, Location} from "history";
import {Global} from "../store/global/types";
import {User} from "../store/users/types";
import {Account, Accounts} from "../store/accounts/types";
import {Community, Communities} from "../store/communities/types";
import {TrendingTags} from "../store/trending-tags/types";
import {ActiveUser} from "../store/active-user/types";
import {ToggleType, UI} from "../store/ui/types";
import {NotificationFilter, Notifications} from "../store/notifications/types";
import {Subscription} from "../store/subscriptions/types";
import {DynamicProps} from "../store/dynamic-props/types";
import {Entries, Entry} from "../store/entries/types";
import {Reblog} from "../store/reblogs/types";
import {Discussion as DiscussionType, SortOrder} from "../store/discussion/types";
import {Transactions} from "../store/transactions/types";
import {Points} from "../store/points/types";


import {toggleTheme, hideIntro, toggleListStyle, dismissNewVersion, muteNotifications, unMuteNotifications, setCurrency, setLang, setNsfw} from "../store/global";
import {fetchTrendingTags} from "../store/trending-tags";
import {updateSubscriptions} from "../store/subscriptions";
import {fetchEntries, addEntry, updateEntry, invalidateEntries} from "../store/entries";
import {fetchDiscussion, sortDiscussion, resetDiscussion, updateReply, addReply, deleteReply} from "../store/discussion";
import {addAccount} from "../store/accounts";
import {addCommunity} from "../store/communities";
import {fetchTransactions, resetTransactions} from "../store/transactions";
import {addUser, deleteUser} from "../store/users";
import {setActiveUser, updateActiveUser} from "../store/active-user";
import {toggleUIProp} from "../store/ui";
import {addReblog} from "../store/reblogs";
import {fetchNotifications, fetchUnreadNotificationCount, setNotificationsFilter, markNotifications} from "../store/notifications";
import {fetchPoints, resetPoints} from "../store/points";
import {setSigningKey} from "../store/signing-key";

export interface PageProps {
    history: History;
    location: Location;

    global: Global;
    toggleTheme: () => void;
    hideIntro: () => void;
    toggleListStyle: () => void;
    dismissNewVersion: () => void;
    muteNotifications: () => void;
    unMuteNotifications: () => void;
    setCurrency: (currency: string, rate: number, symbol: string) => void;
    setLang: (lang:string) => void;
    setNsfw: (value:boolean) => void;

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
    fetchTransactions: (username: string) => void;
    resetTransactions: () => void;

    users: User[];
    addUser: (user: User) => void;
    deleteUser: (username: string) => void;

    activeUser: ActiveUser | null;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;

    ui: UI;
    toggleUIProp: (what: ToggleType) => void;

    reblogs: Reblog[];
    addReblog: (account: string, author: string, permlink: string) => void;

    notifications: Notifications;
    fetchNotifications: (since: string | null) => void;
    fetchUnreadNotificationCount: () => void;
    setNotificationsFilter: (filter: NotificationFilter | null) => void;
    markNotifications: (id: string | null) => void;

    points: Points;
    fetchPoints: (username: string, type?: number) => void;
    resetPoints: () => void

    signingKey: string;
    setSigningKey: (key: string) => void;
}

export const pageMapStateToProps = (state: AppState) => ({
    ...state
});

export const pageMapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
    bindActionCreators(
        {
            toggleTheme,
            hideIntro,
            toggleListStyle,
            muteNotifications,
            unMuteNotifications,
            setCurrency,
            setLang,
            setNsfw,
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
            fetchNotifications,
            fetchUnreadNotificationCount,
            setNotificationsFilter,
            markNotifications,
            fetchPoints,
            resetPoints,
            setSigningKey
        },
        dispatch
    );
