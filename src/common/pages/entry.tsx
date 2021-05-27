import React, {Fragment} from "react";

import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {match} from "react-router";

import moment from "moment";

import {Button} from "react-bootstrap";

import {renderPostBody, setProxyBase, catchPostImage, postBodySummary} from "@ecency/render-helper";

import {Entry, EntryVote} from "../store/entries/types";
import {Community} from "../store/communities/types";
import {FullAccount} from "../store/accounts/types";

import EntryLink, {makePath as makeEntryPath} from "../components/entry-link";

import BaseComponent from "../components/base";
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
import Comment from "../components/comment"
import SimilarEntries from "../components/similar-entries";
import BookmarkBtn from "../components/bookmark-btn";
import EditHistory from "../components/edit-history";
import {error} from "../components/feedback";
import Meta from "../components/meta";
import Theme from "../components/theme/index";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import NotFound from "../components/404";
import ScrollToTop from "../components/scroll-to-top";
import EntryBodyExtra from "../components/entry-body-extra";
import EntryTipBtn from "../components/entry-tip-btn";
import EntryMenu from "../components/entry-menu";
import FavoriteBtn from "../components/favorite-btn";
import FollowControls from "../components/follow-controls";

import * as bridgeApi from "../api/bridge";
import {comment, formatError} from "../api/operations";
import { getAccountFull } from "../api/hive";

import parseDate from "../helper/parse-date";
import entryCanonical from "../helper/entry-canonical";
import tempEntry from "../helper/temp-entry"
import appName from "../helper/app-name";
import {makeJsonMetaDataReply, createReplyPermlink} from "../helper/posting";
import isCommunity from "../helper/is-community";
import accountReputation from '../helper/account-reputation';

import truncate from "../util/truncate";
import * as ls from "../util/local-storage";
import {crossPostMessage} from "../helper/cross-post";

import {_t} from "../i18n";
import {Tsx} from "../i18n/helper";

import {version} from "../../../package.json";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

import defaults from "../constants/defaults.json";



setProxyBase(defaults.imageServer);

interface MatchParams {
    category: string;
    permlink: string;
    username: string;
}

interface Props extends PageProps {
    match: match<MatchParams>;
}

interface AuthorInfo {
    name: string | null;
    about: string | null;
}

interface State {
    loading: boolean;
    replying: boolean;
    showIfHidden: boolean;
    showIfNsfw: boolean;
    editHistory: boolean;
    showProfileBox: boolean;
    authorInfo: AuthorInfo;
}

class EntryPage extends BaseComponent<Props, State> {
    state: State = {
        loading: false,
        replying: false,
        showIfHidden: false,
        showIfNsfw: false,
        editHistory: false,
        showProfileBox: false,
        authorInfo: {
            name: null,
            about: null
        }
    };
    
    viewElement: HTMLDivElement | undefined;

    componentDidMount() {
        this.ensureEntry();

        const {location, global} = this.props;
        if (global.usePrivate && location.search === "?history") {
            this.toggleEditHistory();
        }

        window.addEventListener("scroll", this.detect);
        window.addEventListener("resize", this.detect);

    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        const {location} = this.props;
        if (location.pathname !== prevProps.location.pathname) {
            this.ensureEntry();
        }
    }

    componentWillUnmount() {
        const p1 = new Promise((resolve, reject) => {    
            resolve(window.removeEventListener("scroll", this.detect))
        });
        const p2 = new Promise((resolve, reject) => {    
            resolve(window.removeEventListener("resize", this.detect))
        });
        Promise.all([p1, p2])
    }

    // detects distance between title and comments section sets visibility of profile card
    detect = () => {

       const infoCard:HTMLElement | null = document.getElementById("avatar-fixed");
       const top = this?.viewElement?.getBoundingClientRect()?.top;

       if(infoCard != null && window.scrollY > 180  && top && !(top <= 0)) {
            infoCard.classList.add('visible')
       } else if( infoCard != null && window.scrollY <= 180) {
            infoCard.classList.remove('visible')
       } else if(top && top <= 0 && infoCard !== null){
            infoCard.classList.remove('visible')
       } else return

    }
    

    toggleEditHistory = () => {
        const {editHistory} = this.state;
        this.stateSet({editHistory: !editHistory});
    }

    ensureEntry = async () => {
        const {match, addEntry, updateEntry, addCommunity, activeUser, global} = this.props;
        const entry = this.getEntry();
        const {category, username, permlink} = match.params;
        const author = username.replace("@", "");

        // For fetching authors about and display name information -- start
        if (!global.isMobile) {
            const authorInfo = (await getAccountFull(author))?.profile || {name: "", about: ""}
            authorInfo && this.stateSet({
                authorInfo: {
                    ...this.state.authorInfo,
                    name: authorInfo?.name || "",
                    about: authorInfo?.about || authorInfo?.location || ""
                }
            })    
        }
        // For fetching authors about and display name information -- end

        let reducerFn = updateEntry;

        if (!entry) {
            // The entry isn't in reducer. Fetch it and add to reducer.
            this.stateSet({loading: true});

            reducerFn = addEntry;
        } else {
            const updated = moment.utc(entry.updated);
            const now = moment.utc(Date.now())

            const diffMs = now.diff(updated);
            const duration = moment.duration(diffMs);
            if (duration.asSeconds() < 10) {
                // don't re-fetch recently updated post.
                return;
            }
        }

        bridgeApi.getPost(author, permlink)
            .then((entry) => {
                if (entry) {
                    reducerFn(entry);
                }

                if (isCommunity(category)) {
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

    afterVote = (votes: EntryVote[], estimated: number) => {
        const entry = this.getEntry()!;
        const {updateEntry} = this.props;

        const {payout} = entry;
        const newPayout = payout + estimated;

        updateEntry({
            ...entry,
            active_votes: votes,
            payout: newPayout,
            pending_payout_value: String(newPayout)
        });
    };

    replySubmitted = (text: string) => {
        const entry = this.getEntry()!;
        const {activeUser, addReply, updateEntry} = this.props;

        if (!activeUser || !activeUser.data.__loaded) {
            return;
        }

        const {author: parentAuthor, permlink: parentPermlink} = entry;
        const author = activeUser.username;
        const permlink = createReplyPermlink(entry.author);
        const tags = entry.json_metadata.tags || ['ecency'];

        const jsonMeta = makeJsonMetaDataReply(
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
                tags
            });

            // add new reply to store
            addReply(nReply);

            // remove reply draft
            ls.remove(`reply_draft_${entry.author}_${entry.permlink}`);

            if (entry.children === 0) {
                // Activate discussion section with first comment.
                const nEntry: Entry = {
                    ...entry,
                    children: 1
                }

                updateEntry(nEntry);
            }
        }).catch((e) => {
            error(formatError(e));
        }).finally(() => {
            this.stateSet({replying: false});
        })
    }

    replyTextChanged = (text: string) => {
        const entry = this.getEntry()!;
        ls.set(`reply_draft_${entry.author}_${entry.permlink}`, text);
    }

    reload = () => {
        this.stateSet({loading: true});
        this.ensureEntry();
    }

    render() {
        const {loading, replying, showIfHidden, showIfNsfw, editHistory, authorInfo} = this.state;
        const {global, history} = this.props;

        const navBar = global.isElectron ? NavBarElectron({
            ...this.props,
            reloadFn: this.reload,
            reloading: loading,
        }) : NavBar({...this.props});

        if (loading) {
            return <>{navBar}<LinearProgress/></>;
        }

        const entry = this.getEntry();

        if (!entry) {
            return NotFound({...this.props});
        }

        let setRef = (el:HTMLDivElement) => {
            this.viewElement = el;
        };

        const originalEntry = entry.original_entry || null;

        const community = this.getCommunity();

        const reputation = accountReputation(entry.author_reputation);
        const published = moment(parseDate(entry.created));
        const modified = moment(parseDate(entry.updated));

        // Sometimes tag list comes with duplicate items
        const tags = [...new Set(entry.json_metadata.tags)];
        const app = appName(entry.json_metadata.app);
        const appShort = app.split('/')[0];

        const isComment = !!entry.parent_author;

        const {activeUser} = this.props;

        const ownEntry = activeUser && activeUser.username === entry.author;
        const isHidden = entry?.net_rshares < 0;
        const isMuted = entry?.stats?.gray && entry?.net_rshares >= 0;

        //  Meta config
        const url = entryCanonical(entry) || "";

        const nsfw = entry.json_metadata.tags && entry.json_metadata.tags.includes("nsfw");

        const metaProps = {
            title: `${truncate(entry.title, 67)}`,
            description: `${truncate(postBodySummary(entry.body, 210), 140)} by @${entry.author}`,
            url: entry.url,
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
                <MdHandler global={this.props.global} history={this.props.history}/>
                {navBar}
                <div className="app-content entry-page">
                    <div className="the-entry">
                        {originalEntry && (
                            <div className="cross-post">
                                <div className="cross-post-info">
                                    {_t("entry.cross-post-by")}
                                    {ProfileLink({
                                        ...this.props,
                                        username: entry.author,
                                        children: <div className="cross-post-author">
                                            {UserAvatar({...this.props, username: entry.author, size: "medium"})}
                                            {`@${entry.author}`}
                                        </div>
                                    })}
                                </div>
                                <div className="cross-post-community">
                                    {Tag({
                                        ...this.props,
                                        tag: entry.category,
                                        type: "link",
                                        children: <div className="community-link">
                                            {entry.community_title}
                                        </div>
                                    })}
                                    {_t("entry.cross-post-community")}
                                </div>
                                <div className="cross-post-message">{'"'}{crossPostMessage(entry.body)}{'"'}</div>
                            </div>
                        )}
                        <span itemScope={true} itemType="http://schema.org/Article">
                            {(() => {
                                if (isHidden && !showIfHidden) {
                                    return <div className="hidden-warning">
                                        <span>{_t('entry.hidden-warning')}</span>
                                        <Button variant="danger" size="sm" onClick={() => {
                                            this.stateSet({showIfHidden: true});
                                        }}>{_t('g.show')}</Button>
                                    </div>
                                }

                                if (nsfw && !showIfNsfw && !global.nsfw) {
                                    return <div className="nsfw-warning">
                                        <div className="nsfw-title"><span className="nsfw-badge">NSFW</span></div>
                                        <div className="nsfw-body">
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                this.stateSet({showIfNsfw: true});
                                            }}>{_t("nsfw.reveal")}</a>
                                            {" "} {_t("g.or").toLowerCase()} {" "}

                                            {activeUser && <>
                                                {_t("nsfw.settings-1")}
                                                {" "}
                                              <a href="#" onClick={(e) => {
                                                  e.preventDefault();
                                                  history.push(`/@${activeUser.username}/settings`);
                                              }}>{_t("nsfw.settings-2")}</a>{"."}
                                            </>}

                                            {!activeUser && <>
                                              <Tsx k="nsfw.signup"><span/></Tsx>{"."}
                                            </>}
                                        </div>
                                    </div>
                                }

                                return <>
                                    {(() => {
                                        // Cross post body
                                        if (originalEntry) {
                                            const published = moment(parseDate(originalEntry.created));
                                            const reputation = accountReputation(originalEntry.author_reputation);
                                            const renderedBody = {__html: renderPostBody(originalEntry.body, false, global.canUseWebp)};

                                            return <>
                                                <div className="entry-header">
                                                    <h1 className="entry-title">
                                                        {originalEntry.title}
                                                    </h1>
                                                    <div className="entry-info">
                                                        {ProfileLink({
                                                            ...this.props,
                                                            username: originalEntry.author,
                                                            children: <div className="author-avatar">{UserAvatar({
                                                                ...this.props,
                                                                username: originalEntry.author,
                                                                size: "medium"
                                                            })}</div>
                                                        })}

                                                        <div className="entry-info-inner">
                                                            <div className="info-line-1">
                                                                {ProfileLink({
                                                                    ...this.props,
                                                                    username: originalEntry.author,
                                                                    children: <div className="author notranslate">
                                                                                <span className="author-name">
                                                                                    <span itemProp="author" itemScope={true} itemType="http://schema.org/Person">
                                                                                        <span itemProp="name">
                                                                                            {originalEntry.author}
                                                                                        </span>
                                                                                    </span>
                                                                                </span>
                                                                        <span className="author-reputation" title={_t("entry.author-reputation")}>{reputation}</span>
                                                                    </div>
                                                                })}
                                                            </div>

                                                            <div className="info-line-2">
                                                                <div className="entry-tag">
                                                                    <span className="in-tag">{_t("entry.community-in")}</span>
                                                                    {Tag({
                                                                        ...this.props,
                                                                        tag: originalEntry.category,
                                                                        type: "link",
                                                                        children: <div className="tag-name">
                                                                            {originalEntry.community ? originalEntry.community_title : `#${originalEntry.category}`}
                                                                        </div>
                                                                    })}
                                                                </div>
                                                                <span className="separator"/>
                                                                <span className="date" title={published.format("LLLL")}>{published.fromNow()}</span>
                                                            </div>
                                                        </div>
                                                        <span className="flex-spacer"/>
                                                        {global.usePrivate && BookmarkBtn({
                                                            ...this.props,
                                                            entry: originalEntry
                                                        })}
                                                        {EntryMenu({
                                                            ...this.props,
                                                            entry,
                                                            separatedSharing: true
                                                        })}
                                                    </div>
                                                </div>
                                                <div itemProp="articleBody" className="entry-body markdown-view user-selectable" dangerouslySetInnerHTML={renderedBody}/>
                                            </>;
                                        }

                                        const renderedBody = {__html: renderPostBody(entry.body, false, global.canUseWebp)};
                                        const ctitle = entry.community ? entry.community_title : "";
                                        return <>
                                            <div className="entry-header">
                                                {isMuted && (<div className="hidden-warning">
                                                    <span><Tsx k="entry.muted-warning" args={{community: ctitle}}><span/></Tsx></span>
                                                </div>)}
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
                                                <h1 className="entry-title">
                                                    {entry.title}
                                                </h1>
                                                <div className="entry-info">
                                                    {ProfileLink({
                                                        ...this.props,
                                                        username: entry.author,
                                                        children: <div className="author-avatar">{UserAvatar({
                                                            ...this.props,
                                                            username: entry.author,
                                                            size: "medium"
                                                        })}</div>
                                                    })}

                                                    

                                                    <div className="entry-info-inner">
                                                        <div className="info-line-1">
                                                            {ProfileLink({
                                                                ...this.props,
                                                                username: entry.author,
                                                                children: <div className="author notranslate">
                                                                                <span className="author-name">
                                                                                    <span itemProp="author" itemScope={true} itemType="http://schema.org/Person">
                                                                                        <span itemProp="name">
                                                                                            {entry.author}
                                                                                        </span>
                                                                                    </span>
                                                                                </span>
                                                                    <span className="author-reputation" title={_t("entry.author-reputation")}>{reputation}</span>
                                                                </div>
                                                            })}
                                                        </div>

                                                        <div className="info-line-2">
                                                            <div className="entry-tag">
                                                                <span className="in-tag">{_t("entry.community-in")}</span>
                                                                {Tag({
                                                                    ...this.props,
                                                                    tag: entry.category,
                                                                    type: "link",
                                                                    children: <div className="tag-name">
                                                                        {entry.community ? entry.community_title : `#${entry.category}`}
                                                                    </div>
                                                                })}
                                                            </div>
                                                            <span className="separator"/>
                                                            <span className="date" title={published.format("LLLL")}>{published.fromNow()}</span>
                                                        </div>
                                                    </div>
                                                    <span className="flex-spacer"/>
                                                    {global.usePrivate && BookmarkBtn({
                                                        ...this.props,
                                                        entry
                                                    })}
                                                    {EntryMenu({
                                                        ...this.props,
                                                        entry,
                                                        separatedSharing: true
                                                    })}
                                                </div>
                                            </div>
                                            <meta itemProp="headline name" content={entry.title}/>
                                            <div itemProp="articleBody" className="entry-body markdown-view user-selectable" dangerouslySetInnerHTML={renderedBody}/>
                                            <meta itemProp="image" content={metaProps.image}/>
                                        </>
                                    })()}


                                    { !global.isMobile && (this.state.authorInfo.name !== null || this.state.authorInfo.about !== null) &&
                                            <div className="avatar-fixed" id="avatar-fixed">
                                                <div className="first-line">
                                                    <span className="avatar">
                                                        {ProfileLink({
                                                                ...this.props,
                                                                username: entry.author,
                                                                children: <div className="author-avatar">{UserAvatar({
                                                                    ...this.props,
                                                                    username: entry.author,
                                                                    size: "medium"
                                                                })}</div>
                                                            })}
                                                    </span>
                                                    <span className="user-info">
                                                        <div className="info-line-1">
                                                            {ProfileLink({
                                                                ...this.props,
                                                                username: entry.author,
                                                                children: <div className="author notranslate">
                                                                                <span className="author-name">
                                                                                    <span itemProp="author" itemScope={true} itemType="http://schema.org/Person">
                                                                                        <span itemProp="name">
                                                                                            {entry.author}
                                                                                        </span>
                                                                                    </span>
                                                                                </span>
                                                                    <span className="author-reputation">({reputation})</span>
                                                                </div>
                                                            })}
                                                        </div>
                                                    </span>
                                                </div>
                                                <div className="second-line">
                                                    <div className="entry-tag">
                                                        <div className="name" >{authorInfo.name}</div>
                                                        {authorInfo?.about && authorInfo?.about !== null && <p className="description" >{`${truncate(authorInfo.about, 130)}`}</p>}
                                                    </div>
                                                </div>
                                                <div className="social-wrapper">
                                                    {entry.author && <FollowControls {...this.props} targetUsername={entry.author}/>}
                                                    
                                                    {global.usePrivate && <FavoriteBtn {...this.props} targetUsername={entry.author}/>}

                                                    {global.usePrivate && BookmarkBtn({
                                                        ...this.props,
                                                        entry
                                                    })}
                                                </div>
                                            </div>
                                    }


                                    <div className="entry-footer">
                                        <div className="entry-tags">
                                            {tags.map((t) => {
                                                if (entry.community && entry.community_title && t === entry.community) {
                                                    return <Fragment key={t}>
                                                        {Tag({
                                                            ...this.props,
                                                            tag: {
                                                                name: entry.community,
                                                                title: entry.community_title
                                                            },
                                                            type: "link",
                                                            children: <div className="entry-tag">{t}</div>
                                                        })}
                                                    </Fragment>
                                                }

                                                return (
                                                    <Fragment key={t}>
                                                        {Tag({
                                                            ...this.props,
                                                            tag: t.trim(),
                                                            type: "link",
                                                            children: <div className="entry-tag">{t}</div>
                                                        })}
                                                    </Fragment>
                                                )
                                            })}
                                        </div>
                                        <div className="entry-info">
                                            <div className="date" title={published.format("LLLL")}>
                                                {published.fromNow()}
                                            </div>
                                            <span className="separator"/>
                                            {ProfileLink({
                                                ...this.props,
                                                username: entry.author,
                                                children: <div className="author notranslate">
                                                    <span className="author-name">{entry.author}</span>
                                                    <span className="author-reputation" title={_t("entry.author-reputation")}>{reputation}</span>
                                                </div>
                                            })}
                                            {app && (
                                                <>
                                                    <span className="separator"/>
                                                    <span itemProp="publisher" itemScope={true} itemType="http://schema.org/Person">
                                                            <meta itemProp="name" content={entry.author}/>
                                                        </span>
                                                    <div className="app" title={app}>
                                                        <Tsx k="entry.via-app" args={{app: appShort}}><a href="/faq#source-label"/></Tsx>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="entry-controls" ref={setRef}>
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
                                            {EntryTipBtn({
                                                ...this.props,
                                                entry
                                            })}
                                            {!ownEntry && (
                                                <>
                                                    {EntryReblogBtn({
                                                        ...this.props,
                                                        entry
                                                    })}
                                                </>
                                            )}
                                            <span className="flex-spacer"/>
                                            {EntryMenu({
                                                ...this.props,
                                                entry,
                                                alignBottom: true,
                                                separatedSharing: true
                                            })}
                                        </div>
                                    </div>

                                    {originalEntry && (
                                        <div className="browse-original">
                                            {EntryLink({
                                                ...this.props,
                                                entry: originalEntry,
                                                children: <a className="btn btn-primary">
                                                    {_t('entry.browse-original')}
                                                </a>
                                            })}
                                        </div>
                                    )}

                                    {(!originalEntry && !isComment) && SimilarEntries({
                                        ...this.props,
                                        entry
                                    })}

                                    {activeUser && Comment({
                                        ...this.props,
                                        defText: (ls.get(`reply_draft_${entry.author}_${entry.permlink}`) || ''),
                                        submitText: _t('g.reply'),
                                        onChange: this.replyTextChanged,
                                        onSubmit: this.replySubmitted,
                                        inProgress: replying
                                    })}

                                    {Discussion({
                                        ...this.props,
                                        parent: entry,
                                        community
                                    })}
                                </>
                            })()}
                        </span>
                    </div>
                </div>
                {editHistory && <EditHistory entry={entry} onHide={this.toggleEditHistory}/>}
                <EntryBodyExtra entry={entry}/>
            </>
        );
    }
}


export default connect(pageMapStateToProps, pageMapDispatchToProps)(EntryPage);
