import React, {Component} from "react";
import {History, Location} from "history";

import moment from "moment";

import isEqual from "react-fast-compare";
import {Context} from "react-img-webp";

import {Entry} from "../../store/entries/types";
import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {Community} from "../../store/community/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Reblog} from "../../store/reblogs/types";
import {UI, ToggleType} from "../../store/ui/types";

import defaults from "../../constants/defaults.json";

import {
    catchPostImage,
    postBodySummary,
    setProxyBase,
    // @ts-ignore
} from "@esteemapp/esteem-render-helpers";

setProxyBase(defaults.imageServer);

import ProfileLink from "../profile-link/index";
import Tag from "../tag";
import UserAvatar from "../user-avatar/index";
import EntryLink from "../entry-link/index";
import EntryVoteBtn from "../entry-vote-btn/index";
import EntryReblogBtn from "../entry-reblog-btn/index";
import EntryPayout from "../entry-payout/index";
import EntryVotes from "../entry-votes";
import Tooltip from "../tooltip";

import parseDate from "../../helper/parse-date";
import appName from "../../helper/app-name";

import * as hiveApi from "../../api/hive";
import * as bridgeApi from "../../api/bridge";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names";

import {repeatSvg, pinSvg, commentSvg} from "../../img/svg";

const fallbackImage = require("../../img/fallback.png");
const noImage = require("../../img/noimage.png");
const request = {
    headers: {
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
    }
}
interface Props {
    history: History;
    location: Location;
    global: Global;
    dynamicProps: DynamicProps;
    community?: Community | null;
    users: User[];
    activeUser: ActiveUser | null;
    reblogs: Reblog[];
    entry: Entry;
    ui: UI;
    asAuthor: string;
    promoted: boolean;
    addAccount: (data: Account) => void;
    updateEntry: (entry: Entry) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    addReblog: (account: string, author: string, permlink: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

export default class EntryListItem extends Component<Props> {
    public static defaultProps = {
        asAuthor: "",
        promoted: false,
    };

    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return (
            !isEqual(this.props.entry, nextProps.entry) ||
            !isEqual(this.props.community, nextProps.community) ||
            !isEqual(this.props.global, nextProps.global) ||
            !isEqual(this.props.dynamicProps, nextProps.dynamicProps) ||
            !isEqual(this.props.activeUser, nextProps.activeUser) ||
            !isEqual(this.props.reblogs, nextProps.reblogs)
        );
    }

    afterVote = () => {
        // update the entry
        const {entry, updateEntry} = this.props;
        hiveApi.getPost(entry.author, entry.permlink)
            .then(p => bridgeApi.normalizePost(p))
            .then(r => {
                if (r) updateEntry(r)
            });
    };

    render() {
        const {entry, community, asAuthor, promoted} = this.props;
        const img: string = catchPostImage(entry, 600, 500) || noImage;
        const imgWebp: string = catchPostImage(entry, 600, 500, 'webp') || noImage;
        const summary: string = postBodySummary(entry, 200);

        const app = appName(entry?.json_metadata?.app);

        const reputation = Math.floor(entry.author_reputation);
        const date = moment(parseDate(entry.created));
        const dateRelative = date.fromNow(true);
        const dateFormatted = date.format("LLLL");

        const isChild = !!entry.parent_author;

        const title = entry.title;

        const isVisited = false;
        const isPinned = community && entry.stats?.is_pinned;

        let reBlogged: string | undefined;
        if (asAuthor && asAuthor !== entry.author && !isChild) {
            reBlogged = asAuthor;
        }

        if (entry.reblogged_by && entry.reblogged_by.length > 0) {
            [reBlogged] = entry.reblogged_by;
        }

        const cls = `entry-list-item ${promoted ? "promoted-item" : ""} ${community ? "with-community" : ""}`;
        return (
            <div className={_c(cls)}>
                <div className="item-header">
                    <div className="author-part">
                        {ProfileLink({
                            ...this.props,
                            username: entry.author,
                            children: <a className="author-avatar"><UserAvatar username={entry.author} size="small"/></a>
                        })}
                        {ProfileLink({
                            ...this.props,
                            username: entry.author,
                            children: <div className="author">{entry.author}<span className="author-reputation">{reputation}</span></div>
                        })}
                    </div>
                    {Tag({
                        ...this.props,
                        tag: entry.category,
                        type: "link",
                        children: <a className="category">{entry.community_title || entry.category}</a>
                    })}
                    {!isVisited && <span className="read-mark"/>}
                    <span className="date" title={dateFormatted}>{dateRelative}</span>
                    {isPinned && (
                        <Tooltip content={_t("entry-list-item.pinned")}>
                            <span className="pinned">{pinSvg}</span>
                        </Tooltip>
                    )}
                    {reBlogged && (
                        <span className="reblogged">{repeatSvg} {_t("entry-list-item.reblogged", {n: reBlogged})}</span>
                    )}
                    {promoted && (
                        <>
                            <span className="space"/>
                            <div className="promoted">{_t("entry-list-item.promoted")}</div>
                        </>
                    )}
                </div>
                <div className="item-body">
                    <div className="item-image">
                        {EntryLink({
                            ...this.props,
                            entry,
                            children: <div>
                                <Context.WebPController accept={request.headers.Accept}>
                                    <Context.Image src={img} webP={imgWebp} alt={title}
                                    onError={(e: React.SyntheticEvent) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = fallbackImage;
                                    }} />
                                </Context.WebPController>
                            </div>
                        })}
                    </div>
                    <div className="item-summary">
                        {EntryLink({
                            ...this.props,
                            entry,
                            children: <div className="item-title">{title}</div>
                        })}
                        {EntryLink({
                            ...this.props,
                            entry,
                            children: <div className="item-body">{summary}</div>
                        })}
                    </div>
                    <div className="item-controls">
                        {EntryVoteBtn({
                            ...this.props,
                            afterVote: this.afterVote
                        })}
                        {EntryPayout({
                            ...this.props,
                            entry
                        })}
                        {EntryVotes({
                            ...this.props,
                            entry
                        })}
                        {EntryLink({
                            ...this.props,
                            entry,
                            children: <a className="replies">
                                <Tooltip
                                    content={
                                        entry.children > 0
                                            ? entry.children === 1
                                            ? _t("entry-list-item.replies")
                                            : _t("entry-list-item.replies-n", {n: entry.children})
                                            : _t("entry-list-item.no-replies")
                                    }>
                                <span className="inner">
                                  {commentSvg} {entry.children}
                                </span>
                                </Tooltip>
                            </a>
                        })}
                        {EntryReblogBtn({
                            ...this.props,
                            text: false
                        })}
                        <div className="app">{app}</div>
                    </div>
                </div>
            </div>
        );
    }
}
