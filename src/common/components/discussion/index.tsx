import React, {Component} from "react";

import {History, Location} from "history";

import moment from "moment";

import {Button, Form, FormControl} from "react-bootstrap";

import defaults from "../../constants/defaults.json";

import {renderPostBody, setProxyBase} from "@ecency/render-helper";

setProxyBase(defaults.imageServer);

import {Entry, EntryVote} from "../../store/entries/types";
import {Account, FullAccount} from "../../store/accounts/types";
import {Community, ROLES} from "../../store/communities/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Discussion as DiscussionType, SortOrder} from "../../store/discussion/types";
import {UI, ToggleType} from "../../store/ui/types";

import BaseComponent from "../base";
import ProfileLink from "../profile-link";
import EntryLink from "../entry-link";
import UserAvatar from "../user-avatar";
import EntryVoteBtn from "../entry-vote-btn/index";
import EntryPayout from "../entry-payout/index";
import EntryVotes from "../entry-votes";
import LinearProgress from "../linear-progress";
import Comment from "../comment"
import EntryDeleteBtn from "../entry-delete-btn";
import MuteBtn from "../mute-btn";
import LoginRequired from "../login-required";

import parseDate from "../../helper/parse-date";

import {_t} from "../../i18n";

import {comment, formatError} from "../../api/operations";

import * as ls from "../../util/local-storage";

import {createReplyPermlink, makeJsonMetaDataReply} from "../../helper/posting";
import tempEntry from "../../helper/temp-entry";

import {error} from "../feedback";

import _c from "../../util/fix-class-names"

import {commentSvg, pencilOutlineSvg, deleteForeverSvg} from "../../img/svg";

import {version} from "../../../../package.json";
import accountReputation from '../../helper/account-reputation';
import { getFollowing } from "../../api/hive";
import { iteratorStream } from "@hiveio/dhive/lib/utils";


interface ItemBodyProps {
    entry: Entry;
    global: Global;
}

export class ItemBody extends Component<ItemBodyProps> {
    shouldComponentUpdate(nextProps: Readonly<ItemBodyProps>): boolean {
        return this.props.entry.body !== nextProps.entry.body;
    }

    render() {
        const {entry, global} = this.props;

        const renderedBody = {__html: renderPostBody(entry.body, false, global.canUseWebp)};

        return <div className="item-body markdown-view mini-markdown" dangerouslySetInnerHTML={renderedBody}/>
    }
}


interface ItemProps {
    history: History;
    location: Location;
    global: Global;
    dynamicProps: DynamicProps;
    users: User[];
    activeUser: ActiveUser | null;
    discussion: DiscussionType;
    entry: Entry;
    community: Community | null;
    ui: UI;
    addAccount: (data: Account) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
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
    showIfHidden: boolean;
    isHiddenPermitted: boolean;
    mutedData: string[]
}

export class Item extends BaseComponent<ItemProps, ItemState> {
    state: ItemState = {
        reply: false,
        edit: false,
        inProgress: false,
        showIfHidden: false,
        isHiddenPermitted:false,
        mutedData: []
    }

    componentDidMount(){
        this.fetchMutedUsers()
    }

    afterVote = (votes: EntryVote[], estimated: number) => {
        const {entry, updateReply} = this.props;

        const {payout} = entry;
        const newPayout = payout + estimated;

        updateReply({
            ...entry,
            active_votes: votes,
            payout: newPayout,
            pending_payout_value: String(newPayout)
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
        const {activeUser, addReply, updateReply} = this.props;

        if (!activeUser || !activeUser.data.__loaded) {
            return;
        }

        const {author: parentAuthor, permlink: parentPermlink} = entry;
        const author = activeUser.username;
        const permlink = createReplyPermlink(entry.author);

        const jsonMeta = makeJsonMetaDataReply(
            entry.json_metadata.tags || ['ecency'],
            version
        );

        this.stateSet({inProgress: true});

        comment(
            author,
            parentAuthor,
            parentPermlink,
            permlink,
            '',
            text,
            jsonMeta,
            null,
            true
        ).then(() => {
            const nReply = tempEntry({
                author: activeUser.data as FullAccount,
                permlink,
                parentAuthor,
                parentPermlink,
                title: '',
                body: text,
                tags: []
            });

            // add new reply to store
            addReply(nReply);

            // remove reply draft
            ls.remove(`reply_draft_${entry.author}_${entry.permlink}`);

            // close comment box
            this.toggleReply();

            if (entry.children === 0) {
                // Update parent comment.
                const nParentReply: Entry = {
                    ...entry,
                    children: 1
                }

                updateReply(nParentReply);
            }
        }).catch((e) => {
            error(formatError(e));
        }).finally(() => {
            this.stateSet({inProgress: false});
        });
    }

    updateReply = (text: string) => {
        const {entry} = this.props;
        const {activeUser, updateReply} = this.props;

        const {permlink, parent_author: parentAuthor, parent_permlink: parentPermlink} = entry;
        const jsonMeta = makeJsonMetaDataReply(
            entry.json_metadata.tags || ['ecency'],
            version
        );

        this.stateSet({inProgress: true});

        comment(
            activeUser?.username!,
            parentAuthor!,
            parentPermlink!,
            permlink,
            '',
            text,
            jsonMeta,
            null,
        ).then(() => {
            const nReply: Entry = {
                ...entry,
                body: text
            }

            updateReply(nReply); // update store
            this.toggleEdit(); // close comment box
        }).catch((e) => {
            error(formatError(e));
        }).finally(() => {
            this.stateSet({inProgress: false});
        });
    }

    deleted = () => {
        const {entry, deleteReply} = this.props;
        deleteReply(entry);
    }

    fetchMutedUsers = () => {
        const { activeUser } = this.props;
        if(activeUser){
            getFollowing(activeUser.username, "", "ignore", 100).then(r => {
                if (r) {
                    let filterList = r.map(user=>user.following);
                    this.setState({mutedData: filterList });
                }
            })
        }
    }

    render() {
        const { entry, activeUser, community, location } = this.props;
        const { reply, edit, inProgress, showIfHidden, mutedData, isHiddenPermitted } = this.state;

        const created = moment(parseDate(entry.created));
        const reputation = accountReputation(entry.author_reputation);
        const readMore = entry.children > 0 && entry.depth > 5;
        const showSubList = !readMore && entry.children > 0;
        const canEdit = activeUser && activeUser.username === entry.author;

        const canMute = activeUser && community ? !!community.team.find(m => {
            return m[0] === activeUser.username &&
                [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
        }) : false;

        let isHidden = (!!entry.stats?.gray && !showIfHidden) || (activeUser && mutedData.includes(entry.author) && !showIfHidden);

        const anchorId = `anchor-@${entry.author}/${entry.permlink}`;

        const selected = location.hash && location.hash.replace("#", "") === `@${entry.author}/${entry.permlink}`;
        let normalComponent = (
            <div className={_c(`discussion-item depth-${entry.depth} ${isHidden ? "hidden-item" : ""} ${selected ? "selected-item" : ""}`)}>
                <div className="item-anchor" id={anchorId}/>
                <div className="item-inner">
                    <div className="item-figure">
                        {ProfileLink({...this.props, username: entry.author, children: <a>{UserAvatar({...this.props, username: entry.author, size: "medium"})}</a>})}
                    </div>
                    <div className="item-content">
                        <div className="item-header">
                            {ProfileLink({
                                ...this.props,
                                username: entry.author,
                                children: <div className="author notranslate">
                                    <span className="author-name">{entry.author}</span>
                                    <span className="author-reputation">{reputation}</span>
                                </div>
                            })}
                            <span className="separator"/>
                            {EntryLink({
                                ...this.props,
                                entry,
                                children: <span className="date" title={created.format("LLLL")}>
                                  {created.fromNow()}
                                </span>
                            })}
                        </div>
                        {(() => {
                            if (isHidden) {
                                return <div className="reveal-item">
                                    <Button variant="outline-danger" size="sm" onClick={() => {
                                        this.stateSet({showIfHidden: true});
                                    }}>{_t("discussion.reveal")}</Button>
                                </div>
                            }
                            
                            return <>
                                <ItemBody global={this.props.global} entry={entry}/>
                                <div className="item-controls">
                                    {EntryVoteBtn({
                                        ...this.props,
                                        entry,
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
                                    <a className={_c(`reply-btn ${edit ? 'disabled' : ''}`)} onClick={this.toggleReply}>
                                        {_t("g.reply")}
                                    </a>
                                    {(community && canMute) && MuteBtn({
                                        entry,
                                        community: community!,
                                        activeUser: activeUser!,
                                        onSuccess: (entry) => {
                                            const {updateReply} = this.props;
                                            updateReply(entry);
                                        }
                                    })}
                                    {canEdit && (
                                        <>
                                            <a title={_t('g.edit')} className={_c(`edit-btn ${reply ? 'disabled' : ''}`)} onClick={this.toggleEdit}>
                                                {pencilOutlineSvg}
                                            </a>
                                            {(entry.is_paidout || entry.net_rshares > 0 || entry.children > 0) ? null : EntryDeleteBtn({
                                                ...this.props,
                                                entry,
                                                onSuccess: this.deleted,
                                                children: <a title={_t('g.delete')} className="delete-btn">{deleteForeverSvg}</a>
                                            })}
                                        </>
                                    )}
                                </div>
                            </>
                        })()}

                        {readMore && (
                            <div className="read-more">
                                {EntryLink({
                                    ...this.props,
                                    entry,
                                    children: <a>{_t("discussion.read-more")}</a>
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {reply && Comment({
                    ...this.props,
                    defText: (ls.get(`reply_draft_${entry.author}_${entry.permlink}`) || ''),
                    submitText: _t('g.reply'),
                    cancellable: true,
                    onChange: this.replyTextChanged,
                    onSubmit: this.submitReply,
                    onCancel: this.toggleReply,
                    inProgress: inProgress,
                    autoFocus: true
                })}

                {edit && Comment({
                    ...this.props,
                    defText: entry.body,
                    submitText: _t('g.update'),
                    cancellable: true,
                    onSubmit: this.updateReply,
                    onCancel: this.toggleEdit,
                    inProgress: inProgress,
                    autoFocus: true
                })}

                {showSubList && <List {...this.props} parent={entry}/>}
            </div>
        );

        return normalComponent;
    }
}


interface ListProps {
    history: History;
    location: Location;
    global: Global;
    dynamicProps: DynamicProps;
    users: User[];
    activeUser: ActiveUser | null;
    discussion: DiscussionType;
    parent: Entry;
    community: Community | null;
    ui: UI;
    addAccount: (data: Account) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    updateReply: (reply: Entry) => void;
    addReply: (reply: Entry) => void;
    deleteReply: (reply: Entry) => void;
    toggleUIProp: (what: ToggleType) => void;
}

interface ListState {
    isHiddenPermitted: boolean;
    mutedData: string[]
}

export class List extends Component<ListProps> {
    state: ListState = {
        isHiddenPermitted: false,
        mutedData: []
    }
    
    componentDidMount(){
        this.fetchMutedUsers()
    }

    fetchMutedUsers = () => {
        const { activeUser } = this.props;
        if(activeUser){
            getFollowing(activeUser.username, "", "ignore", 100).then(r => {
                if (r) {
                    let filterList = r.map(user=>user.following);
                    this.setState({mutedData: filterList });
                }
            })
        }
    }

    render() {
        const {discussion, parent, activeUser} = this.props;
        const { isHiddenPermitted, mutedData } = this.state;

        const {list} = discussion;

        let filtered = list.filter(
            (x) => x.parent_author === parent.author && x.parent_permlink === parent.permlink
        );

        if (filtered.length === 0) {
            return null;
        }

        let mutedContent = filtered.filter(item => item.stats?.gray || (activeUser && mutedData.includes(item.author) && item.depth === 1 && item.parent_author === parent.author) );
        let unmutedContent = filtered.filter(md => mutedContent.every(fd => fd.post_id !== md.post_id))
        let data = isHiddenPermitted ? [...unmutedContent, ...mutedContent] : unmutedContent;
        
        
        return (
            <div className="discussion-list">
                {data.map((d) => (
                    <Item key={`${d.author}-${d.permlink}`} {...this.props} entry={d}/>
                ))}
                {!isHiddenPermitted && mutedContent.length >0 &&
                    <div className="hidden-warning d-flex justify-content-between flex-1 align-items-center mt-3">
                        <div className="flex-1">{_t("discussion.reveal-muted-long-description")}</div>
                        <div onClick={()=>this.setState({isHiddenPermitted:true})} className="pointer p-3"><b>{_t("g.show")}</b></div>
                    </div>
                }
            </div>
        );
    }
}


interface Props {
    history: History;
    location: Location
    global: Global;
    dynamicProps: DynamicProps;
    users: User[];
    activeUser: ActiveUser | null;
    parent: Entry;
    community: Community | null;
    discussion: DiscussionType;
    ui: UI;
    addAccount: (data: Account) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    fetchDiscussion: (parent_author: string, parent_permlink: string) => void;
    sortDiscussion: (order: SortOrder) => void;
    resetDiscussion: () => void;
    updateReply: (reply: Entry) => void;
    addReply: (reply: Entry) => void;
    deleteReply: (reply: Entry) => void;
    toggleUIProp: (what: ToggleType) => void;
}

interface State {
    visible: boolean
}

export class Discussion extends Component<Props, State> {
    state: State = {
        visible: !!this.props.activeUser
    }

    componentDidMount() {
        const {activeUser} = this.props;
        if (activeUser) {
            this.fetch();
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        const {parent} = this.props;
        if (parent.url !== prevProps.parent.url) { // url changed
            this.fetch();
        }

        const {discussion} = this.props;
        if (prevProps.discussion.list.length === 0 && discussion.list.length > 0) {
            const {location} = this.props;
            if (location.hash) {
                const permlink = location.hash.replace("#", "");
                const anchorId = `anchor-${permlink}`;
                const anchorEl = document.getElementById(anchorId);
                if (anchorEl) {
                    anchorEl.scrollIntoView();
                }
            }
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

    orderChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        const order = e.target.value as SortOrder;
        const {sortDiscussion} = this.props;
        sortDiscussion(SortOrder[order]);
    };

    show = () => {
        this.setState({visible: true});
        this.fetch();
    }

    render() {
        const {parent, discussion, activeUser} = this.props;
        const {visible} = this.state;
        const {loading, order} = discussion;
        const count = parent.children;

        if (loading) {
            return <div className="discussion"><LinearProgress/></div>;
        }

        const join = <div className="discussion-card">
            <div className="icon">{commentSvg}</div>
            <div className="label">{_t("discussion.join")}</div>
            {LoginRequired({
                ...this.props,
                children: <Button>{_t("discussion.btn-join")}</Button>
            })}
        </div>;

        if (!activeUser && count < 1) {
            return <div className="discussion">{join}</div>;
        }

        if (count < 1) {
            return <div className="discussion empty"/>
        }

        const strCount = count > 1 ? _t("discussion.n-replies", {n: count}) : _t("discussion.replies");

        if (!visible && count >= 1) {
            return <div className="discussion">
                <div className="discussion-card">
                    <div className="icon">{commentSvg}</div>
                    <div className="label">{strCount}</div>
                    <Button onClick={this.show}>{_t("g.show")}</Button>
                </div>
            </div>
        }

        return (
            <div className="discussion">
                {!activeUser && <>{join}</>}
                <div className="discussion-header">
                    <div className="count"> {commentSvg} {strCount}</div>
                    <span className="flex-spacer"/>
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

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        location: p.location,
        global: p.global,
        dynamicProps: p.dynamicProps,
        users: p.users,
        activeUser: p.activeUser,
        parent: p.parent,
        community: p.community,
        discussion: p.discussion,
        ui: p.ui,
        addAccount: p.addAccount,
        setActiveUser: p.setActiveUser,
        updateActiveUser: p.updateActiveUser,
        deleteUser: p.deleteUser,
        fetchDiscussion: p.fetchDiscussion,
        sortDiscussion: p.sortDiscussion,
        resetDiscussion: p.resetDiscussion,
        updateReply: p.updateReply,
        addReply: p.addReply,
        deleteReply: p.deleteReply,
        toggleUIProp: p.toggleUIProp,
    }

    return <Discussion {...props} />;
}
