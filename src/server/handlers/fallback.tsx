import express from "express";

import {initialState as globalInitialState} from "../../common/store/global";
import {initialState as dynamicPropsInitialState} from "../../common/store/dynamic-props";
import {initialState as trendingTagsInitialState} from "../../common/store/trending-tags";
import {initialState as accountsInitialState} from "../../common/store/accounts";
import {initialState as transactionsInitialState} from "../../common/store/transactions";
import {initialState as communityInitialState} from "../../common/store/community";
import {initialState as entriesInitialState} from "../../common/store/entries";
import {initialState as usersInitialState} from "../../common/store/users";
import {initialState as activeUserInitialState} from "../../common/store/active-user";
import {initialState as reblogsInitialState} from "../../common/store/reblogs";
import {initialState as discussionInitialState} from "../../common/store/discussion";

import {render} from "../template";

import {readGlobalCookies} from "../helper";
import {getPromotedEntries} from "../../common/helper/promoted";

export default async (req: express.Request, res: express.Response) => {
    const preLoadedState = {
        global: {
            ...globalInitialState,
            ...readGlobalCookies(req),
        },
        dynamicProps: {...dynamicPropsInitialState},
        trendingTags: {...trendingTagsInitialState},
        community: communityInitialState,
        accounts: [...accountsInitialState],
        transactions: {...transactionsInitialState},
        users: usersInitialState,
        activeUser: activeUserInitialState,
        reblogs: reblogsInitialState,
        discussion: discussionInitialState,
        entries: {
            ...entriesInitialState,
            ['__promoted__']: {
                entries: getPromotedEntries(),
                error: null,
                loading: false,
                hasMore: true,
            }
        },
    };

    res.send(render(req, preLoadedState));
};
