import React, {Component, Fragment} from "react";

import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {match} from "react-router";

import moment from "moment";

import {Button} from "react-bootstrap";

import defaults from "../constants/defaults.json";

import {
    renderPostBody,
    setProxyBase,
    catchPostImage,
    postBodySummary,
    // @ts-ignore
} from "@esteemapp/esteem-render-helpers";

setProxyBase(defaults.imageServer);

import {Entry} from "../store/entries/types";
import {Community, ROLES} from "../store/communities/types";

import {makePath as makeEntryPath} from "../components/entry-link";

import ProfileLink from "../components/profile-link";
import UserAvatar from "../components/user-avatar";
import Tag from "../components/tag";
import EntryVoteBtn from "../components/entry-vote-btn/index";
import EntryPayout from "../components/entry-payout/index";
import EntryVotes from "../components/entry-votes";
import Discussion from "../components/discussion";
import MdHandler from "../components/md-handler";
import LinearProgress from "../components/linear-progress";
import EntryReblogBtn from "../components/entry-reblog-btn/index";
import EntryEditBtn from "../components/entry-edit-btn/index";
import EntryDeleteBtn from "../components/entry-delete-btn";
import Comment from "../components/comment"
import SimilarEntries from "../components/similar-entries";
import BookmarkBtn from "../components/bookmark-btn";
import EditHistoryBtn from "../components/edit-history-btn";
import PinBtn from "../components/pin-btn";
import MuteBtn from "../components/mute-btn";
import {error} from "../components/feedback";
import Meta from "../components/meta";
import Theme from "../components/theme/index";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar/index";
import NotFound from "../components/404";
import ScrollToTop from "../components/scroll-to-top";

import * as hiveApi from "../api/hive";
import * as bridgeApi from "../api/bridge";
import {comment, formatError} from "../api/operations";

import parseDate from "../helper/parse-date";
import entryCanonical from "../helper/entry-canonical";
import tempEntry from "../helper/temp-entry"

import {makeJsonMetadataReply, createReplyPermlink} from "../helper/posting";

import {makeShareUrlReddit, makeShareUrlTwitter, makeShareUrlFacebook} from "../helper/url-share";

import truncate from "../util/truncate";
import * as ls from "../util/local-storage";

import {timeSvg, redditSvg, facebookSvg, twitterSvg, deleteForeverSvg} from "../img/svg";

import {_t} from "../i18n";

import {version} from "../../../package.json";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

interface MatchParams {
    category: string;
    permlink: string;
    username: string;
}

interface Props extends PageProps {
    match: match<MatchParams>;
}

interface State {
    loading: boolean;
    replying: boolean;
    showIfHidden: boolean;
}

class EntryPage extends Component<Props, State> {
    state: State = {
        loading: false,
        replying: false,
        showIfHidden: false
    };

    _mounted: boolean = true;

    componentDidMount() {
        this.ensureEntry();
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        const {location} = this.props;
        if (location.pathname !== prevProps.location.pathname) {
            this.ensureEntry();
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (obj: {}, cb = undefined) => {
        if (this._mounted) {
            this.setState(obj, cb);
        }
    };

    ensureEntry = () => {
        const {match, addEntry, updateEntry, addCommunity, activeUser} = this.props;
        const entry = this.getEntry();
        const {category, username, permlink} = match.params;
        const author = username.replace("@", "");

        let reducerFn = updateEntry;

        if (!entry) {
            // The entry isn't in reducer. Fetch it and add to reducer.
            this.stateSet({loading: true});

            reducerFn = addEntry;
        }

        bridgeApi.getPost(author, permlink)
            .then((entry) => {
                if (entry) {
                    reducerFn(entry);
                }

                if (/^hive-\d+/.test(category)) {
                    return bridgeApi.getCommunity(category, activeUser?.username);
                }

                return null;
            })
            .then((data: Community | null) => {
                if (data) {
                    addCommunity(data);
                }
            })
            .finally(() => {
                this.stateSet({loading: false});
            });
    };

    getEntry = (): Entry | undefined => {
        const {entries, match} = this.props;
        const {username, permlink} = match.params;
        const author = username.replace("@", "");

        const groupKeys = Object.keys(entries);
        let entry: Entry | undefined = undefined;

        for (const k of groupKeys) {
            entry = entries[k].entries.find((x) => x.author === author && x.permlink === permlink);
            if (entry) {
                break;
            }
        }

        return entry;
    };

    getCommunity = (): Community | null => {
        const {communities, match} = this.props;
        const {category} = match.params;
        return communities.find((x) => x.name === category) || null;
    }

    shareReddit = (entry: Entry) => {
        const u = makeShareUrlReddit(entry.category, entry.author, entry.permlink, entry.title);
        window.open(u, "_blank");
    };

    shareTwitter = (entry: Entry) => {
        const u = makeShareUrlTwitter(entry.category, entry.author, entry.permlink, entry.title);
        window.open(u, "_blank");
    };

    shareFacebook = (entry: Entry) => {
        const u = makeShareUrlFacebook(entry.category, entry.author, entry.permlink);
        window.open(u, "_blank");
    };

    afterVote = () => {
        // update the entry
        const entry = this.getEntry()!;
        const {updateEntry} = this.props;
        hiveApi.getPost(entry.author, entry.permlink)
            .then(p => bridgeApi.normalizePost(p))
            .then(r => {
                if (r) updateEntry(r);
                this.forceUpdate();
            });
    };

    replySubmitted = (text: string) => {
        const entry = this.getEntry()!;
        const {activeUser, addReply, updateEntry} = this.props;

        const {author: parentAuthor, permlink: parentPermlink} = entry;
        const author = activeUser?.username!;
        const permlink = createReplyPermlink(entry.author);
        const options = null;
        const tags = entry.json_metadata.tags || ['ecency'];

        const jsonMeta = makeJsonMetadataReply(
            tags,
            version
        );

        this.stateSet({replying: true});

        comment(
            author,
            parentAuthor,
            parentPermlink,
            permlink,
            '',
            text,
            jsonMeta,
            options,
        ).then(() => {
            const nReply = tempEntry({
                author: activeUser?.data!,
                permlink,
                parentAuthor,
                parentPermlink,
                title: '',
                body: text,
                tags
            });

            addReply(nReply); // add new reply to store

            return hiveApi.getPost(entry.author, entry.permlink) // get entry
        }).then((entry) => {
            return bridgeApi.normalizePost(entry); // normalize
        }).then((nEntry) => {
            if (nEntry) {
                updateEntry(nEntry); // update store for the entry
            }

            ls.remove(`reply_draft_${entry.author}_${entry.permlink}`); // remove reply draft

            this.stateSet({replying: false}); // done
        }).catch((e) => {
            error(formatError(e));
            this.stateSet({replying: false});
        })
    }

    replyTextChanged = (text: string) => {
        const entry = this.getEntry()!;
        ls.set(`reply_draft_${entry.author}_${entry.permlink}`, text);
    }

    deleted = () => {
        const {history} = this.props;
        history.push('/');
    }

    render() {
        const {loading, replying, showIfHidden} = this.state;
        const {global} = this.props;

        if (loading) {
            return <LinearProgress/>;
        }

        const entry = this.getEntry();

        if (!entry) {
            return <NotFound/>;
        }

        const community = this.getCommunity();

        const reputation = Math.floor(entry.author_reputation);
        const published = moment(parseDate(entry.created));
        const modified = moment(parseDate(entry.updated));

        const renderedBody = {__html: renderPostBody(entry.body, false, global.canUseWebp)};

        // Sometimes tag list comes with duplicate items
        const tags = [...new Set(entry.json_metadata.tags)];
        const app = entry.json_metadata?.app;

        const isComment = entry.parent_author !== undefined;

        const {activeUser} = this.props;

        const ownEntry = activeUser && activeUser.username === entry.author;
        const editable = ownEntry && !isComment;

        const canPinOrMute = activeUser && community ? !!community.team.find(m => {
            return m[0] === activeUser.username &&
                [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
        }) : false;

        const isHidden = entry.stats.gray;

        //  Meta config
        const url = entryCanonical(entry) || "";

        const metaProps = {
            title: `${truncate(entry.title, 60)} | by @${entry.author}`,
            description: truncate(postBodySummary(entry.body, 210), 200),
            url,
            canonical: url,
            image: catchPostImage(entry.body, 600, 500, global.canUseWebp ? 'webp' : 'match'),
            published: published.toISOString(),
            modified: modified.toISOString(),
            tag: tags[0],
            keywords: tags.join(", "),
        };

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                <Feedback/>
                <MdHandler history={this.props.history}/>
                {NavBar({...this.props})}

                <div className="app-content entry-page">
                    <div className="the-entry">
                        {(() => {
                            if (isHidden && !showIfHidden) {
                                return <div className="hidden-warning">
                                    <span>{_t('entry.hidden-warning')}</span>
                                    <Button variant="danger" size="sm" onClick={() => {
                                        this.stateSet({showIfHidden: true});
                                    }}>{_t('g.show')}</Button>
                                </div>
                            }

                            return <>
                                <div className="entry-header">
                                    {isComment && (
                                        <div className="comment-entry-header">
                                            <div className="comment-entry-header-title">RE: {entry.title}</div>
                                            <div className="comment-entry-header-info">{_t("entry.comment-entry-title")}</div>
                                            <p className="comment-entry-root-title">{entry.title}</p>
                                            <ul className="comment-entry-opts">
                                                <li>
                                                    <Link to={entry.url}>{_t("entry.comment-entry-go-root")}</Link>
                                                </li>
                                                {entry.depth > 1 && (
                                                    <li>
                                                        <Link to={makeEntryPath(entry.category, entry.parent_author!, entry.parent_permlink!)}>
                                                            {_t("entry.comment-entry-go-parent")}
                                                        </Link>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                    <h1 className="entry-title">{entry.title}</h1>
                                    <div className="entry-info">
                                        {ProfileLink({
                                            ...this.props,
                                            username: entry.author,
                                            children: <div className="author-part">
                                                <div className="author-avatar">
                                                    {UserAvatar({...this.props, username: entry.author, size: "small"})}
                                                </div>
                                                <div className="author notranslate">
                                                    <span className="author-name">{entry.author}</span>
                                                    <span className="author-reputation">{reputation}</span>
                                                </div>
                                            </div>
                                        })}
                                        <span className="separator"/>
                                        <span className="date" title={published.format("LLLL")}>{published.fromNow()}</span>
                                        <span className="flex-spacer"/>
                                        {BookmarkBtn({
                                            ...this.props,
                                            entry: entry
                                        })}
                                    </div>
                                </div>
                                <div className="entry-body markdown-view user-selectable" dangerouslySetInnerHTML={renderedBody}/>
                                <div className="entry-footer">
                                    <div className="entry-tags">
                                        {!tags.find(x => x === entry?.category) && Tag({
                                            ...this.props,
                                            tag: entry.category,
                                            type: "link",
                                            children: <div className="entry-tag">{entry.category}</div>
                                        })}
                                        {tags.map((t) => (
                                            <Fragment key={t}>
                                                {Tag({
                                                    ...this.props,
                                                    tag: t,
                                                    type: "link",
                                                    children: <div className="entry-tag">{t}</div>
                                                })}
                                            </Fragment>
                                        ))}
                                    </div>
                                    <div className="entry-info">
                                        <div className="left-side">
                                            <div className="date" title={published.format("LLLL")}>
                                                {timeSvg}
                                                {published.fromNow()}
                                            </div>
                                            <span className="separator"/>
                                            {ProfileLink({
                                                ...this.props,
                                                username: entry.author,
                                                children: <div className="author notranslate">
                                                    <span className="author-name">{entry.author}</span>
                                                    <span className="author-reputation">{reputation}</span>
                                                </div>
                                            })}
                                            {app && (
                                                <>
                                                    <span className="separator"/>
                                                    <div className="app" dangerouslySetInnerHTML={{__html: _t("entry.via-app", {app})}}/>
                                                </>
                                            )}
                                        </div>
                                        <div className="right-side">
                                            <EditHistoryBtn entry={entry} append={<span className="separator"/>}/>
                                            {ownEntry && (
                                                <>
                                                    {editable && EntryEditBtn({entry})}
                                                    <span className="separator"/>
                                                    {EntryDeleteBtn({
                                                        ...this.props,
                                                        entry,
                                                        onSuccess: this.deleted,
                                                        children: <a title={_t('g.delete')} className="delete-btn">{deleteForeverSvg}</a>
                                                    })}
                                                </>
                                            )}
                                            {!ownEntry && (
                                                <>
                                                    {EntryReblogBtn({
                                                        ...this.props,
                                                        text: true,
                                                        entry
                                                    })}
                                                </>
                                            )}
                                            {(community && canPinOrMute) && (
                                                <>
                                                    <span className="separator"/>
                                                    {PinBtn({
                                                        community,
                                                        entry,
                                                        activeUser: activeUser!,
                                                        onSuccess: (entry) => {
                                                            const {updateEntry} = this.props;
                                                            updateEntry(entry);
                                                        }
                                                    })}
                                                    <span className="separator"/>
                                                    {MuteBtn({
                                                        community,
                                                        entry,
                                                        activeUser: activeUser!,
                                                        onSuccess: (entry) => {
                                                            const {updateEntry} = this.props;
                                                            updateEntry(entry);
                                                        }
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="entry-controls">
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
                                        <div className="sub-menu">
                                            <a className="sub-menu-item"
                                               onClick={() => {
                                                   this.shareReddit(entry!);
                                               }}>
                                                {redditSvg}
                                            </a>
                                            <a className="sub-menu-item"
                                               onClick={() => {
                                                   this.shareTwitter(entry!);
                                               }}>
                                                {twitterSvg}
                                            </a>
                                            <a className="sub-menu-item"
                                               onClick={() => {
                                                   this.shareFacebook(entry!);
                                               }}>
                                                {facebookSvg}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                {Comment({
                                    ...this.props,
                                    defText: (ls.get(`reply_draft_${entry.author}_${entry.permlink}`) || ''),
                                    submitText: _t('g.reply'),
                                    onChange: this.replyTextChanged,
                                    onSubmit: this.replySubmitted,
                                    inProgress: replying
                                })}
                                {SimilarEntries({
                                    ...this.props,
                                    entry
                                })}
                            </>
                        })()}
                        {Discussion({
                            ...this.props,
                            parent: entry,
                            community
                        })}
                    </div>
                </div>
            </>
        );
    }
}


export default connect(pageMapStateToProps, pageMapDispatchToProps)(EntryPage);
