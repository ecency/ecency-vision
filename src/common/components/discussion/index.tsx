import React, {Component} from "react";

import {History} from "history";

import isEqual from "react-fast-compare";

import moment from "moment";

import {Form, FormControl} from "react-bootstrap";

import defaults from "../../constants/defaults.json";

import {
    renderPostBody,
    setProxyBase,
    // @ts-ignore
} from "@esteemapp/esteem-render-helpers";

import {Entry} from "../../store/entries/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Discussion as DiscussionType, SortOrder} from "../../store/discussion/types";

import ProfileLink from "../profile-link";
import EntryLink from "../entry-link";
import UserAvatar from "../user-avatar";
import EntryVoteBtn from "../entry-vote-btn/index";
import EntryPayout from "../entry-payout/index";
import EntryVotes from "../entry-votes";
import DownloadTrigger from "../download-trigger";
import LinearProgress from "../linear-progress";

import parseDate from "../../helper/parse-date";

import {_t} from "../../i18n";
import _c from "../../util/fix-class-names";

import * as hiveApi from "../../api/hive";
import * as bridgeApi from "../../api/bridge";

import {commentSvg} from "../../img/svg";

setProxyBase(defaults.imageServer);

interface ItemProps {
    history: History;
    global: Global;
    dynamicProps: DynamicProps;
    users: User[];
    activeUser: ActiveUser | null;
    discussion: DiscussionType;
    entry: Entry;
    addAccount: (data: Account) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    updateReply: (reply: Entry) => void;
}

export class Item extends Component<ItemProps> {
    shouldComponentUpdate(nextProps: Readonly<ItemProps>): boolean {
        return !isEqual(this.props.global, nextProps.global) ||
            !isEqual(this.props.entry, nextProps.entry) ||
            !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username)
    }

    afterVote = () => {
        const {entry, updateReply} = this.props;

        hiveApi.getPost(entry.author, entry.permlink)
            .then(p => bridgeApi.normalizePost(p))
            .then(r => {
                if (r) updateReply(r);
            });
    }

    render() {
        const {entry} = this.props;
        const created = moment(parseDate(entry.created));
        const renderedBody = {__html: renderPostBody(entry.body, false)};
        const reputation = Math.floor(entry.author_reputation);
        const readMore = entry.children > 0 && entry.depth > 5;
        const showSubList = !readMore && entry.children > 0;

        return (
            <div className={`discussion-item depth-${entry.depth}`}>
                <div className="item-inner">
                    <div className="item-figure">
                        <ProfileLink {...this.props} username={entry.author}>
                            <a>
                                <UserAvatar username={entry.author} size="medium"/>
                            </a>
                        </ProfileLink>
                    </div>
                    <div className="item-content">
                        <div className="item-header">
                            <ProfileLink {...this.props} username={entry.author}>
                                <div className="author">
                                    <span className="author-name">{entry.author}</span>
                                    <span className="author-reputation">{reputation}</span>
                                </div>
                            </ProfileLink>
                            <span className="separator"/>
                            <EntryLink {...this.props} entry={entry}>
                                <span className="date" title={created.format("LLLL")}>
                                  {created.fromNow()}
                                </span>
                            </EntryLink>
                        </div>
                        <div className="item-body markdown-view mini-markdown" dangerouslySetInnerHTML={renderedBody}/>
                        <div className="item-controls">
                            <EntryVoteBtn {...this.props} entry={entry} afterVote={this.afterVote}/>
                            <EntryPayout {...this.props} entry={entry}/>
                            <EntryVotes {...this.props} entry={entry}/>
                            <DownloadTrigger>
                                <span className="reply-btn" role="none">
                                  {_t("g.reply")}
                                </span>
                            </DownloadTrigger>
                        </div>
                        {readMore && (
                            <div className="read-more">
                                <EntryLink {...this.props} entry={entry}>
                                    <a>{_t("discussion.read-more")}</a>
                                </EntryLink>
                            </div>
                        )}
                    </div>
                </div>

                {showSubList && <List {...this.props} parent={entry}/>}
            </div>
        );
    }
}


interface ListProps {
    history: History;
    global: Global;
    dynamicProps: DynamicProps;
    users: User[];
    activeUser: ActiveUser | null;
    discussion: DiscussionType;
    parent: Entry;
    addAccount: (data: Account) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    updateReply: (reply: Entry) => void;
}

export class List extends Component<ListProps> {
    render() {
        const {discussion, parent} = this.props;

        const {list} = discussion;

        const filtered = list.filter(
            (x) => x.parent_author === parent.author && x.parent_permlink === parent.permlink
        );

        if (filtered.length === 0) {
            return null;
        }

        return (
            <div className="discussion-list">
                {filtered.map((d, k) => (
                    <Item key={k} {...this.props} entry={d}/>
                ))}
            </div>
        );
    }
}


interface Props {
    history: History;
    global: Global;
    dynamicProps: DynamicProps;
    users: User[];
    activeUser: ActiveUser | null;
    parent: Entry;
    discussion: DiscussionType;
    addAccount: (data: Account) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    fetchDiscussion: (parent_author: string, parent_permlink: string) => void;
    sortDiscussion: (order: SortOrder) => void;
    resetDiscussion: () => void;
    updateReply: (reply: Entry) => void;
}


export default class Discussion extends Component<Props> {
    componentDidMount() {
        this.fetch();
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        const {parent} = this.props;
        if (parent.url !== prevProps.parent.url) {
            this.fetch();
        }
    }

    componentWillUnmount() {
        const {resetDiscussion} = this.props;
        resetDiscussion();
    }

    fetch = () => {
        const {parent, fetchDiscussion} = this.props;
        const {author, permlink} = parent;
        fetchDiscussion(author, permlink);
    };

    orderChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const order = e.target.value as SortOrder;
        const {sortDiscussion} = this.props;
        sortDiscussion(SortOrder[order]);
    };

    render() {
        const {parent, discussion} = this.props;
        const {loading, order} = discussion;

        if (parent.children === 0) {
            return <div className="discussion"/>;
        }

        return (
            <div className={_c(`discussion ${loading ? "loading" : ""} `)}>
                {loading && <LinearProgress/>}
                <div className="discussion-header">
                    <div className="count">
                        {commentSvg} {_t("discussion.count", {n: parent.children})}
                    </div>
                    <div className="order">
                        <span className="order-label">{_t("discussion.order")}</span>
                        <Form.Control as="select" size="sm" value={order} onChange={this.orderChanged} disabled={loading}>
                            <option value="trending">{_t("discussion.order-trending")}</option>
                            <option value="author_reputation">{_t("discussion.order-reputation")}</option>
                            <option value="votes">{_t("discussion.order-votes")}</option>
                            <option value="created">{_t("discussion.order-created")}</option>
                        </Form.Control>
                    </div>
                </div>
                <List {...this.props} parent={parent}/>
            </div>
        );
    }
}
