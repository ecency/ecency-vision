import React, {Component} from "react";

import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {match} from "react-router";

import moment from "moment";

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
import {error} from "../components/feedback";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar/index";
import NotFound from "../components/404";

import * as hiveApi from "../api/hive";
import * as bridgeApi from "../api/bridge";
import {comment, formatError} from "../api/operations";

import parseDate from "../helper/parse-date";
import entryCanonical from "../helper/entry-canonical";

import {makeJsonMetadataReply, createReplyPermlink, makeCommentOptions} from "../helper/posting";

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
    replying: boolean
}

class EntryPage extends Component<Props, State> {
    state: State = {
        loading: false,
        replying: false,
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
        const {match, addEntry} = this.props;

        if (!this.getEntry()) {
            this.stateSet({loading: true});

            const {username, permlink} = match.params;

            bridgeApi.getPost(username.replace("@", ""), permlink)
                .then((entry) => {
                    if (entry) {
                        addEntry(entry);
                    }
                })
                .finally(() => {
                    this.stateSet({loading: false});
                });
        }
    };

    getEntry = (): Entry | undefined => {
        const {entries, match} = this.props;
        const {username, permlink} = match.params;

        const groupKeys = Object.keys(entries);
        let entry: Entry | undefined = undefined;

        for (const k of groupKeys) {
            entry = entries[k].entries.find((x) => x.author === username.replace("@", "") && x.permlink === permlink);
            if (entry) {
                break;
            }
        }

        return entry;
    };

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
        const {activeUser, users, addReply, updateEntry} = this.props;

        const user = users.find((x) => x.username === activeUser?.username)!;

        const {author: parentAuthor, permlink: parentPermlink} = entry;
        const author = activeUser?.username!;
        const permlink = createReplyPermlink(entry.author);
        const options = makeCommentOptions(author, permlink);

        const jsonMeta = makeJsonMetadataReply(
            entry.json_metadata.tags || ['ecency'],
            version
        );

        this.stateSet({replying: true});

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
            return hiveApi.getPost(author, permlink); // get reply
        }).then((reply) => {
            return bridgeApi.normalizePost(reply); // normalize
        }).then((nReply) => {
            if (nReply) {
                addReply(nReply); // add new reply to store
            }

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
        const {loading, replying} = this.state;

        if (loading) {
            return <LinearProgress/>;
        }

        const entry = this.getEntry();

        if (!entry) {
            return <NotFound/>;
        }

        const reputation = Math.floor(entry.author_reputation);
        const published = moment(parseDate(entry.created));
        const modified = moment(parseDate(entry.updated));

        const renderedBody = {__html: renderPostBody(entry.body, false)};

        // Sometimes tag list comes with duplicate items
        const tags = [...new Set(entry.json_metadata.tags)];
        const app = entry.json_metadata?.app;

        const isComment = entry.parent_author !== undefined;

        const {activeUser} = this.props;

        const ownEntry = activeUser && activeUser.username === entry.author;
        const editable = ownEntry && !isComment;


        //  Meta config
        const url = entryCanonical(entry) || "";

        const metaProps = {
            title: truncate(entry.title, 60),
            description: truncate(postBodySummary(entry.body, 210), 200),
            url,
            canonical: url,
            image: catchPostImage(entry.body),
            published: published.toISOString(),
            modified: modified.toISOString(),
            tag: tags[0],
            keywords: tags.join(", "),
        };

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                <Feedback/>
                <MdHandler history={this.props.history}/>
                {NavBar({...this.props})}

                <div className="app-content entry-page">
                    <div className="the-entry">
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
                                            <UserAvatar username={entry.author} size="medium"/>
                                        </div>
                                        <div className="author">
                                            <span className="author-name">{entry.author}</span>
                                            <span className="author-reputation">{reputation}</span>
                                        </div>
                                    </div>
                                })}
                                <Tag {...this.props} tag={entry.category} type="link">
                                    <a className="category">{entry.category}</a>
                                </Tag>
                                <span className="separator"/>
                                <span className="date" title={published.format("LLLL")}>{published.fromNow()}</span>
                            </div>
                        </div>
                        <div className="entry-body markdown-view user-selectable" dangerouslySetInnerHTML={renderedBody}/>
                        <div className="entry-footer">
                            <div className="entry-tags">
                                {tags.map((t) => (
                                    <Tag {...this.props} tag={t} key={t} type="link">
                                        <div className="entry-tag">{t}</div>
                                    </Tag>
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
                                        children: <div className="author">
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
                                    {ownEntry && (
                                        <>
                                            {editable && (<EntryEditBtn entry={entry}/>)}
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
                                            <EntryReblogBtn {...this.props} text={true} entry={entry}/>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="entry-controls">
                                <EntryVoteBtn {...this.props} entry={entry} afterVote={this.afterVote}/>
                                <EntryPayout {...this.props} entry={entry}/>
                                <EntryVotes {...this.props} entry={entry}/>
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
                        <Comment {...this.props}
                                 defText={ls.get(`reply_draft_${entry.author}_${entry.permlink}`) || ''}
                                 submitText={_t('g.reply')}
                                 onChange={this.replyTextChanged}
                                 onSubmit={this.replySubmitted}
                                 inProgress={replying}
                        />
                        <Discussion {...this.props} parent={entry}/>
                    </div>
                </div>
            </>
        );
    }
}


export default connect(pageMapStateToProps, pageMapDispatchToProps)(EntryPage);
