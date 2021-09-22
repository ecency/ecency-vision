import React, {Component} from "react";

import {History, Location} from "history";

import moment from "moment";

import isEqual from "react-fast-compare";

import {catchPostImage, postBodySummary, setProxyBase} from "@ecency/render-helper";

import {Entry, EntryVote} from "../../store/entries/types";
import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {Community, Communities} from "../../store/communities/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Reblogs} from "../../store/reblogs/types";
import {UI, ToggleType} from "../../store/ui/types";
import {EntryPinTracker} from "../../store/entry-pin-tracker/types";

import ProfileLink from "../profile-link/index";
import Tag from "../tag";
import UserAvatar from "../user-avatar/index";
import EntryLink from "../entry-link/index";
import EntryVoteBtn from "../entry-vote-btn/index";
import EntryReblogBtn from "../entry-reblog-btn/index";
import EntryPayout from "../entry-payout/index";
import EntryVotes from "../entry-votes";
import Tooltip from "../tooltip";
import EntryMenu from "../entry-menu";
import parseDate from "../../helper/parse-date";
import {_t} from "../../i18n";
import {Tsx} from "../../i18n/helper";

import _c from "../../util/fix-class-names";
import truncate from "../../util/truncate";

import {repeatSvg, pinSvg, commentSvg, muteSvg, volumeOffSvg, closeSvg, downArrowSvg, menuDownSvg} from "../../img/svg";

import defaults from "../../constants/defaults.json";
import { ProfilePreview } from "../profile-preview";

setProxyBase(defaults.imageServer);


interface Props {
    history: History;
    location: Location;
    global: Global;
    dynamicProps: DynamicProps;
    communities: Communities;
    community?: Community | null;
    users: User[];
    activeUser: ActiveUser | null;
    reblogs: Reblogs;
    entry: Entry;
    ui: UI;
    entryPinTracker: EntryPinTracker;
    signingKey: string;
    asAuthor: string;
    promoted: boolean;
    order: number;
    addAccount: (data: Account) => void;
    updateEntry: (entry: Entry) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    fetchReblogs: () => void;
    addReblog: (author: string, permlink: string) => void;
    deleteReblog: (author: string, permlink: string) => void;
    toggleUIProp: (what: ToggleType | "login") => void;
    addCommunity: (data: Community) => void;
    trackEntryPin: (entry: Entry) => void;
    setSigningKey: (key: string) => void;
    setEntryPin: (entry: Entry, pin: boolean) => void;
    muted?: boolean
}

interface State {
    showNsfw: boolean;
    showMuted: boolean;
    mounted: boolean;
    showProfileDetails: boolean;
    mobilePosition: string;
    delayHandler: any
}

export default class EntryListItem extends Component<Props, State> {
    state: State = {
        showNsfw: false,
        showMuted: false,
        mounted: false,
        showProfileDetails:false,
        mobilePosition:'',
        delayHandler: null
    }

    public static defaultProps = {
        asAuthor: "",
        promoted: false,
    };

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return (
            !isEqual(this.props.entry, nextProps.entry) ||
            !isEqual(this.props.community, nextProps.community) ||
            !isEqual(this.props.global, nextProps.global) ||
            !isEqual(this.props.dynamicProps, nextProps.dynamicProps) ||
            !isEqual(this.props.activeUser, nextProps.activeUser) ||
            !isEqual(this.props.reblogs, nextProps.reblogs) ||
            !isEqual(this.props.communities, nextProps.communities) ||
            !isEqual(this.props.entryPinTracker, nextProps.entryPinTracker) ||
            !isEqual(this.state, nextState)
        );
    }

    afterVote = (votes: EntryVote[], estimated: number) => {
        const {entry, updateEntry} = this.props;

        const {payout} = entry;
        const newPayout = payout + estimated;

        updateEntry({
            ...entry,
            active_votes: votes,
            payout: newPayout,
            pending_payout_value: String(newPayout)
        });
    };

    toggleNsfw = () => {
        this.setState({showNsfw: true});
    }

    componentDidMount(){
        const { entry, muted } = this.props;
        if(muted){
            this.setState({ showMuted: true })
        }
        document.getElementsByTagName("html")[0].style.position = 'relative';
        this.setState({ mounted: true })
    }

    componentWillUnmount(){
        document.getElementsByTagName("html")[0].style.position = 'unset'
        this.setState({ mounted: false })
    }

    componentDidUpdate(prevProps:Props){
        if(this.props.entry !== prevProps.entry && this.props.muted && this.state.mounted){
            this.setState({ showMuted: true })
        }
    }

    showMiniProfile = (e: any) => {
        e.persist();
        const timeout =
            setTimeout(()=>{
                e.stopPropagation()
                if(this.props.global.isMobile && e.type == "click"){
                let id = e.target.id.length > 0 ? e.target.id : e.target.parentNode.id
                this.setState({mobilePosition: id });
                scrollTo(0,0)
            }
            this.setState({showProfileDetails:true });
            document.getElementsByTagName("body")[0].classList.add("overflow-sm-hidden")}, this.props.global.isMobile ? 0 : 500)
        this.setState({delayHandler:timeout})
    }

    hideMiniProfile = (e:any) => {
        const { mobilePosition, delayHandler } = this.state;
        clearTimeout(delayHandler)
        e.stopPropagation()
        setTimeout(()=>{
                this.setState({showProfileDetails:false});
                document.getElementsByTagName("body")[0].classList.remove("overflow-sm-hidden");   
                if(this.props.global.isMobile && mobilePosition.length > 0){
                    document!.getElementById(mobilePosition)!.scrollIntoView({block: "center"})
                }
        },500)
    }

    render() {
        const {entry: theEntry, community, asAuthor, promoted, global, activeUser, history, order,} = this.props;
        const { showProfileDetails, mounted } = this.state;

        const fallbackImage = global.isElectron ? "./img/fallback.png" : require("../../img/fallback.png");
        const noImage = global.isElectron ?  "./img/noimage.svg" : require("../../img/noimage.svg");
        const nsfwImage = global.isElectron ? "./img/nsfw.png" : require("../../img/nsfw.png");
        const crossPost = !!(theEntry.original_entry);

        const entry = theEntry.original_entry || theEntry;

        const imgGrid: string = (global.canUseWebp ? catchPostImage(entry, 600, 500, 'webp') : catchPostImage(entry, 600, 500)) || noImage;
        const imgRow: string = (global.canUseWebp ? catchPostImage(entry, 260, 200, 'webp') : catchPostImage(entry, 260, 200)) || noImage;
        let svgSizeRow = imgRow === noImage ? "noImage" : "";
        let svgSizeGrid = imgGrid === noImage ? "172px" : "auto";
        
        const summary: string = postBodySummary(entry, 200);

        const date = moment(parseDate(entry.created));
        const dateRelative = date.fromNow(true);
        const dateFormatted = date.format("LLLL");

        const isChild = !!entry.parent_author;

        const title = entry.title;

        const isVisited = false;
        const isPinned = community && !!entry.stats?.is_pinned;

        let reBlogged: string | undefined;
        if (asAuthor && asAuthor !== entry.author && !isChild) {
            reBlogged = asAuthor;
        }

        if (entry.reblogged_by && entry.reblogged_by.length > 0) {
            [reBlogged] = entry.reblogged_by;
        }

        let thumb: JSX.Element | null = null;
        if (global.listStyle === 'grid') {
            thumb = (
                <img src={imgGrid} alt={title} style={{ width: svgSizeGrid }} onError={(e: React.SyntheticEvent) => {
                    const target = e.target as HTMLImageElement;
                    target.src = fallbackImage;
                }}
                />
            );
        }
        if (global.listStyle === 'row') {
            thumb = (
                <picture>
                    <source srcSet={imgRow} media="(min-width: 576px)"/>
                    <img srcSet={imgGrid} alt={title} onError={(e: React.SyntheticEvent) => {
                        const target = e.target as HTMLImageElement;
                        target.src = fallbackImage;
                    }}/>
                </picture>
            );
        }
        const nsfw = entry.json_metadata.tags && Array.isArray(entry.json_metadata.tags) && entry.json_metadata.tags.includes("nsfw");

        const cls = `entry-list-item ${promoted ? "promoted-item" : ""}`;

        return mounted ? (
            <div className={_c(cls)} id={(entry.author + entry.permlink).replace(/[0-9]/g, '')}>

                {(() => {
                    if (crossPost) {

                        return <div className="cross-item">
                            {ProfileLink({
                                ...this.props,
                                username: theEntry.author,
                                children: <a className="cross-item-author notranslate">{`@${theEntry.author}`}</a>
                            })}
                            {" "}
                            {_t("entry-list-item.cross-posted")}
                            {" "}
                            {EntryLink({
                                ...this.props,
                                entry: theEntry.original_entry!,
                                children: <a className="cross-item-link">
                                    {truncate(`@${theEntry.original_entry!.author}/${theEntry.original_entry!.permlink}`, 40)}
                                </a>
                            })}
                            {" "}
                            {_t("entry-list-item.cross-posted-to")}
                            {" "}
                            {Tag({
                                ...this.props,
                                tag: theEntry.community && theEntry.community_title ? {name: theEntry.community, title: theEntry.community_title} : theEntry.category,
                                type: "link",
                                children: <a className="community-name">{theEntry.community_title || theEntry.category}</a>
                            })}
                        </div>
                    }

                    return null;
                })()}

                <div className="item-header">
                    <div className="item-header-main">
                        <div className="author-part" id={String(entry.post_id)}>
                            <div
                                onMouseEnter={this.showMiniProfile}
                                onMouseLeave={this.hideMiniProfile}
                                className="d-flex align-items-center"
                                id={String(entry.post_id)}
                            >
                                <div className="author-avatar d-sm-none" onClick={this.showMiniProfile} id={String(entry.post_id)}>{UserAvatar({...this.props, username: entry.author, size: "small"})}</div>
                                {ProfileLink({
                                    ...this.props,
                                    username: entry.author,
                                    children: <a className="author-avatar d-none d-sm-block">{UserAvatar({...this.props, username: entry.author, size: "small"})}</a>
                                })}

                                <div className="author notranslate d-flex d-sm-none align-items-center" onClick={this.showMiniProfile} id={String(entry.post_id)}>
                                    <span>{entry.author}</span>
                                </div>
                            
                                {ProfileLink({
                                    ...this.props,
                                    username: entry.author,
                                    children: <div className="author notranslate d-none d-sm-flex align-items-center">
                                                <span>{entry.author}</span>
                                            </div>
                                })}
                                {showProfileDetails && entry.author && 
                                    <ProfilePreview
                                        username={entry.author}
                                        {...this.props}
                                        onClose={this.hideMiniProfile}
                                    />
                                }
                            </div>
                             
                            <span
                                className="author-down-arrow ml-1"
                                onClick={this.showMiniProfile}
                                id={String(entry.post_id)}
                            >
                                {menuDownSvg}
                            </span>
                        </div>
                        {Tag({
                            ...this.props,
                            tag: entry.community && entry.community_title ? {name: entry.community, title: entry.community_title} : entry.category,
                            type: "link",
                            children: <a className="category">{entry.community_title || entry.category}</a>
                        })}
                        {!isVisited && <span className="read-mark"/>}
                        <span className="date" title={dateFormatted}>{dateRelative}</span>
                    </div>
                    <div className="item-header-features">
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
                                <span className="flex-spacer"/>
                                <div className="promoted"><a href="/faq#how-promotion-work">{_t("entry-list-item.promoted")}</a></div>
                            </>
                        )}
                    </div>
                </div>
                <div className="item-body">
                    {(() => {
                        if (nsfw && !this.state.showNsfw && !global.nsfw) {
                            return <>
                                <div className="item-image item-image-nsfw">
                                    <img src={nsfwImage} alt={title}/>
                                </div>
                                <div className="item-summary">
                                    <div className="item-nsfw"><span className="nsfw-badge">NSFW</span></div>
                                    <div className="item-nsfw-options">
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault();
                                            this.toggleNsfw();
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
                            </>
                        }
                        if (this.state.showMuted) {
                            return <>
                                <div className="item-image item-image-nsfw">
                                    <img src={nsfwImage} alt={title}/>
                                </div>
                                <div className="item-summary">
                                    <div className="item-nsfw"><span className="nsfw-badge text-capitalize d-inline-flex align-items-center"><div className="mute-icon">{volumeOffSvg}</div> <div>{_t("g.muted")}</div></span></div>
                                    <div className="item-nsfw-options">
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault();
                                            this.setState({ showMuted: false })
                                        }}>{_t("g.muted-message")}</a>

                                        {!activeUser && <>
                                          <Tsx k="nsfw.signup"><span/></Tsx>{"."}
                                        </>}
                                    </div>
                                </div>
                            </>
                        }

                        return <>
                            <div className={"item-image " + svgSizeRow}>
                                {EntryLink({
                                    ...this.props,
                                    entry: (crossPost ? theEntry : entry),
                                    children: <div>
                                        {thumb}
                                    </div>
                                })}
                            </div>
                            <div className="item-summary">
                                {EntryLink({
                                    ...this.props,
                                    entry: (crossPost ? theEntry : entry),
                                    children: <div className="item-title">{title}</div>
                                })}
                                {EntryLink({
                                    ...this.props,
                                    entry: (crossPost ? theEntry : entry),
                                    children: <div className="item-body">{summary}</div>
                                })}
                            </div>
                        </>
                    })()}
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
                            entry: (crossPost ? theEntry : entry),
                            children: <a className="replies notranslate">
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
                            ...this.props
                        })}
                        {EntryMenu({
                            ...this.props,
                            alignBottom: order >= 1,
                            entry,
                        })}
                    </div>
                </div>
            </div>
        ) : null;
    }
}
