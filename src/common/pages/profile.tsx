import React, {Component} from "react";

import {connect} from "react-redux";

import {match} from "react-router";

import {ListStyle} from "../store/global/types";

import {makeGroupKey} from "../store/entries";

import Meta from "../components/meta";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import NotFound from "../components/404";
import LinearProgress from "../components/linear-progress/index";
import EntryListLoadingItem from "../components/entry-list-loading-item";
import DetectBottom from "../components/detect-bottom";
import EntryListContent from "../components/entry-list";

import ProfileCard from "../components/profile-card";
import ProfileMenu from "../components/profile-menu";
import ProfileCover from "../components/profile-cover";
import Wallet from "../components/wallet";

import {getAccountFull} from "../api/hive";

import defaults from "../constants/defaults.json";

import _c from "../util/fix-class-names";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

interface MatchParams {
    username: string;
    section?: string;
}

interface Props extends PageProps {
    match: match<MatchParams>;
}

interface State {
    loading: boolean;
}

class ProfilePage extends Component<Props, State> {
    state: State = {
        loading: false,
    };

    _mounted: boolean = true;

    async componentDidMount() {
        await this.ensureAccount();

        const {match, global, fetchEntries, fetchTransactions} = this.props;

        if (!["wallet", "points"].includes(match.params.section || '')) {
            // fetch posts
            fetchEntries(global.filter, global.tag, false);
        }

        // fetch wallet transactions
        fetchTransactions(match.params.username);
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        const {match, global, fetchEntries, fetchTransactions, resetTransactions} = this.props;
        const {global: pGlobal} = prevProps;

        // username changed. re-fetch wallet transactions
        if (match.params.username !== prevProps.match.params.username) {
            this.ensureAccount().then(() => {
                resetTransactions();
                fetchTransactions(match.params.username);
            });
        }

        // Wallet and points are not a correct filter to fetch posts
        if (["wallet", "points"].includes(match.params.section || '')) {
            return;
        }

        // filter or username changed. fetch posts.
        if (!(global.filter === pGlobal.filter && global.tag === pGlobal.tag)) {
            fetchEntries(global.filter, global.tag, false);
        }
    }

    componentWillUnmount() {
        const {resetTransactions} = this.props;

        // reset transactions on unload
        resetTransactions();

        this._mounted = false;
    }

    ensureAccount = async () => {
        const {match, accounts, addAccount} = this.props;

        const username = match.params.username.replace("@", "");
        const account = accounts.find((x) => x.name === username);

        if (!account) {
            this.stateSet({loading: true});

            try {
                const data = await getAccountFull(username);
                // make sure acccount exists
                if (data.name === username) {
                    addAccount(data);
                }
            } catch (e) {
            }

            this.stateSet({loading: false});
        }

        return true;
    };

    stateSet = (obj: {}, cb = undefined) => {
        if (this._mounted) {
            this.setState(obj, cb);
        }
    };

    bottomReached = () => {
        const {global, entries, fetchEntries} = this.props;
        const {filter, tag} = global;
        const groupKey = makeGroupKey(filter, tag);

        const data = entries[groupKey];
        const {loading, hasMore} = data;

        if (!loading && hasMore) {
            fetchEntries(filter, tag, true);
        }
    };

    render() {
        const {global, entries, accounts, match} = this.props;
        const {loading} = this.state;

        if (loading) {
            return <LinearProgress/>;
        }

        const username = match.params.username.replace("@", "");
        const {section = "posts"} = match.params;
        const account = accounts.find((x) => x.name === username);

        if (!account) {
            return <NotFound/>;
        }

        //  Meta config
        const url = `${defaults.base}/@${username}${section ? `/${section}` : ""}`;
        const metaProps = {
            title: account.profile?.name || account.name,
            description: account.profile?.about || "",
            url,
            canonical: url,
            image: `${defaults.imageServer}/u/${username}/avatar/large`,
            rss: `${defaults.base}/@${username}/rss`,
            keywords: `${username}, ${username}'s blog`,
        };

        const promoted = entries['__promoted__'].entries;

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                <Feedback/>
                {NavBar({...this.props})}

                <div className="app-content profile-page">
                    <div className="profile-side">
                        {ProfileCard({
                            ...this.props,
                            account
                        })}
                    </div>
                    <div className="content-side">
                        {ProfileMenu({
                            ...this.props,
                            username,
                            section
                        })}
                        {ProfileCover({
                            ...this.props,
                            account
                        })}
                        {(() => {
                            if (section === "wallet") {
                                return Wallet({
                                    ...this.props,
                                    account
                                });
                            }

                            if (section === "points") {
                                return <span>Henlo</span>
                            }

                            const {filter, tag} = global;
                            const groupKey = makeGroupKey(filter, tag);
                            const data = entries[groupKey];

                            if (data !== undefined) {
                                const entryList = data?.entries;
                                const loading = data?.loading;

                                return (
                                    <>
                                        <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
                                            <div className={_c(`entry-list-body ${global.listStyle === ListStyle.grid ? "grid-view" : ""}`)}>
                                                {loading && entryList.length === 0 && <EntryListLoadingItem/>}
                                                {EntryListContent({...this.props, entries: entryList, promotedEntries: promoted})}
                                            </div>
                                        </div>
                                        {loading && entryList.length > 0 ? <LinearProgress/> : ""}
                                        <DetectBottom onBottom={this.bottomReached}/>
                                    </>
                                );
                            }

                            return null;
                        })()}
                    </div>
                </div>
            </>
        );
    }
}


export default connect(pageMapStateToProps, pageMapDispatchToProps)(ProfilePage);
