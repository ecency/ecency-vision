import express from "express";

import {AppState} from "../common/store";

import {initialState as globalInitialState} from "../common/store/global";
import {initialState as dynamicPropsInitialState} from "../common/store/dynamic-props";
import {initialState as trendingTagsInitialState} from "../common/store/trending-tags";
import {initialState as accountsInitialState} from "../common/store/accounts";
import {initialState as communityInitialState} from "../common/store/community";
import {initialState as transactionsInitialState} from "../common/store/transactions";
import {initialState as usersInitialState} from "../common/store/users";
import {initialState as activeUserInitialState} from "../common/store/active-user";
import {initialState as reblogsInitialState} from "../common/store/reblogs";
import {initialState as discussionInitialState} from "../common/store/discussion";
import {initialState as uiInitialState} from "../common/store/ui";
import {initialState as subscriptionsInitialState} from "../common/store/subscriptions";
import {initialState as notificationsInitialState} from "../common/store/notifications";
import {initialState as entriesInitialState} from "../common/store/entries";
import {initialState as pointsInitialState} from "../common/store/points";
import {initialState as signingKeyInitialState} from "../common/store/signing-key";

import {getSearchIndexCount} from "./helper";

export const makePreloadedState = async (req: express.Request): Promise<AppState> => {

    return {
        global: {
            ...globalInitialState,
            searchIndexCount: await getSearchIndexCount(),
            canUseWebp: req.headers.accept !== undefined && req.headers.accept.indexOf("image/webp") !== -1
        },
        dynamicProps: dynamicPropsInitialState,
        trendingTags: trendingTagsInitialState,
        community: communityInitialState,
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
        signingKey: signingKeyInitialState
    }
}
