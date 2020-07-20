import React, {Component} from "react";

import {History} from "history";

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
import {UI, ToggleType} from "../../store/ui/types";

import ProfileLink from "../profile-link";
import EntryLink from "../entry-link";
import UserAvatar from "../user-avatar";
import EntryVoteBtn from "../entry-vote-btn/index";
import EntryPayout from "../entry-payout/index";
import EntryVotes from "../entry-votes";
import LinearProgress from "../linear-progress";
import Comment from "../comment"
import EntryDeleteBtn from "../entry-delete-btn";

import parseDate from "../../helper/parse-date";

import {_t} from "../../i18n";
import _c from "../../util/fix-class-names";

import * as hiveApi from "../../api/hive";
import * as bridgeApi from "../../api/bridge";
import {comment, formatError} from "../../api/operations";

import * as ls from "../../util/local-storage";

import {createReplyPermlink, makeCommentOptions, makeJsonMetadataReply} from "../../helper/posting";

import {error} from "../feedback";

import {commentSvg, pencilOutlineSvg, deleteForeverSvg} from "../../img/svg";

import {version} from "../../../../package.json";

setProxyBase(defaults.imageServer);


interface ItemBodyProps {
    entry: Entry;
}

export class ItemBody extends Component<ItemBodyProps> {
    shouldComponentUpdate(nextProps: Readonly<ItemBodyProps>): boolean {
        return this.props.entry.body !== nextProps.entry.body;
    }

    render() {
        const {entry} = this.props;
        const renderedBody = {__html: renderPostBody(entry.body, false)};

        return <div className="item-body markdown-view mini-markdown" dangerouslySetInnerHTML={renderedBody}/>
    }
}


interface ItemProps {
    history: History;
    global: Global;
    dynamicProps: DynamicProps;
    users: User[];
    activeUser: ActiveUser | null;
    discussion: DiscussionType;
    entry: Entry;
    ui: UI;
    addAccount: (data: Account) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    updateReply: (reply: Entry) => void;
    addReply: (reply: Entry) => void;
    deleteReply: (reply: Entry) => void;
    toggleUIProp: (what: ToggleType) => void;
}

interface ItemState {
    reply: boolean;
    edit: boolean;
    inProgress: boolean;
}

export class Item extends Component<ItemProps, ItemState> {
    state: ItemState = {
        reply: false,
        edit: false,
        inProgress: false,
    }

    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (obj: {}, cb: () => void = () => {
    }) => {
        if (this._mounted) {
            this.setState(obj, cb);
        }
    };

    afterVote = () => {
        const {entry, updateReply} = this.props;

        hiveApi.getPost(entry.author, entry.permlink)
            .then(p => bridgeApi.normalizePost(p))
            .then(r => {
                if (r) updateReply(r);
            });
    }

    toggleReply = () => {
        const {reply, edit} = this.state;
        if (edit) {
            return;
        }
        this.stateSet({reply: !reply});
    }

    toggleEdit = () => {
        const {edit, reply} = this.state;
        if (reply) {
            return;
        }
        this.stateSet({edit: !edit});
    }

    replyTextChanged = (text: string) => {
        const {entry} = this.props;
        ls.set(`reply_draft_${entry.author}_${entry.permlink}`, text);
    }

    submitReply = (text: string) => {
        const {entry} = this.props;
        const {activeUser, users, addReply, updateReply} = this.props;

        const user = users.find((x) => x.username === activeUser?.username)!;

        const {author: parentAuthor, permlink: parentPermlink} = entry;
        const author = activeUser?.username!;
        const permlink = createReplyPermlink(entry.author);
        const options = makeCommentOptions(author, permlink);

        const jsonMeta = makeJsonMetadataReply(
            entry.json_metadata.tags || ['ecency'],
            version
        );

        this.stateSet({inProgress: true});

        comment(
            user,
            parentAuthor,
            parentPermlink,
            permlink,
            '',
            text,
            jsonMeta,
            options,
        ).then(() => {
            return hiveApi.getPost(author, permlink); // get new reply
        }).then((reply) => {
            return bridgeApi.normalizePost(reply); // normalize
        }).then((nReply) => {
            if (nReply) {
                addReply(nReply); // add new reply to store
            }

            return hiveApi.getPost(parentAuthor, parentPermlink) // get the reply
        }).then((entry) => {
            return bridgeApi.normalizePost(entry); // normalize
        }).then((nEntry) => {
            if (nEntry) {
                updateReply(nEntry); // update store for the reply
            }

            ls.remove(`reply_draft_${entry.author}_${entry.permlink}`); // remove reply draft
            this.stateSet({inProgress: false}); // done
            this.toggleReply(); // close comment box
        }).catch((e) => {
            error(formatError(e));
            this.stateSet({inProgress: false});
        })
    }

    updateReply = (text: string) => {
        const {entry} = this.props;
        const {activeUser, users, updateReply} = this.props;

        const user = users.find((x) => x.username === activeUser?.username)!;

        const {author, permlink, parent_author: parentAuthor, parent_permlink: parentPermlink} = entry;
        const jsonMeta = makeJsonMetadataReply(
            entry.json_metadata.tags || ['ecency'],
            version
        );
        let options = null;

        const bExist = entry.beneficiaries.some(
            x => x && x.account === 'ecency'
        );

        if (!bExist) {
            options = makeCommentOptions(author, permlink);
        }

        this.stateSet({inProgress: true});

        comment(
            user,
            parentAuthor!,
            parentPermlink!,
            permlink,
            '',
            text,
            jsonMeta,
            options,
        ).then(() => {
            return hiveApi.getPost(author, permlink); // get the reply
        }).then((reply) => {
            return bridgeApi.normalizePost(reply); // normalize
        }).then((nReply) => {
            if (nReply) {
                updateReply(nReply); // update store
            }

            this.stateSet({inProgress: false}); // done
            this.toggleEdit(); // close comment box
        }).catch((e) => {
            error(formatError(e));
            this.stateSet({inProgress: false});
        })
    }

    deleted = () => {
        const {entry, deleteReply} = this.props;
        deleteReply(entry);
    }

    render() {
        const {entry, activeUser} = this.props;
        const {reply, edit, inProgress} = this.state;

        const created = moment(parseDate(entry.created));
        const reputation = Math.floor(entry.author_reputation);
        const readMore = entry.children > 0 && entry.depth > 5;
        const showSubList = !readMore && entry.children > 0;
        const canEdit = activeUser && activeUser.username === entry.author;

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
                        <ItemBody entry={entry}/>
                        <div className="item-controls">
                            <EntryVoteBtn {...this.props} entry={entry} afterVote={this.afterVote}/>
                            <EntryPayout {...this.props} entry={entry}/>
                            <EntryVotes {...this.props} entry={entry}/>
                            <a className={_c(`reply-btn ${edit ? 'disabled' : ''}`)} onClick={this.toggleReply}>
                                {_t("g.reply")}
                            </a>
                            {canEdit && (
                                <>
                                    <a title={_t('g.edit')} className={_c(`edit-btn ${reply ? 'disabled' : ''}`)} onClick={this.toggleEdit}>
                                        {pencilOutlineSvg}
                                    </a>
                                    <EntryDeleteBtn {...this.props} entry={entry} onSuccess={this.deleted}>
                                        <a title={_t('g.delete')} className="delete-btn">
                                            {deleteForeverSvg}
                                        </a>
                                    </EntryDeleteBtn>
                                </>
                            )}
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

                {reply && (
                    <Comment {...this.props}
                             defText={ls.get(`reply_draft_${entry.author}_${entry.permlink}`) || ''}
                             submitText={_t('g.reply')}
                             cancellable={true}
                             onChange={this.replyTextChanged}
                             onSubmit={this.submitReply}
                             onCancel={this.toggleReply}
                             inProgress={inProgress}
                             autoFocus={true}
                    />
                )}

                {edit && (
                    <Comment {...this.props}
                             defText={entry.body}
                             submitText={_t('g.update')}
                             cancellable={true}
                             onSubmit={this.updateReply}
                             onCancel={this.toggleEdit}
                             inProgress={inProgress}
                             autoFocus={true}
                    />
                )}

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
    ui: UI;
    addAccount: (data: Account) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    updateReply: (reply: Entry) => void;
    addReply: (reply: Entry) => void;
    deleteReply: (reply: Entry) => void;
    toggleUIProp: (what: ToggleType) => void;
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
    ui: UI;
    addAccount: (data: Account) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    fetchDiscussion: (parent_author: string, parent_permlink: string) => void;
    sortDiscussion: (order: SortOrder) => void;
    resetDiscussion: () => void;
    updateReply: (reply: Entry) => void;
    addReply: (reply: Entry) => void;
    deleteReply: (reply: Entry) => void;
    toggleUIProp: (what: ToggleType) => void;
}


export default class Discussion extends Component<Props> {
    componentDidMount() {
        this.fetch();
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        const {parent} = this.props;
        if (parent.url !== prevProps.parent.url) { // url changed
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
