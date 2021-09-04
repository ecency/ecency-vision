import React from "react";

import {connect} from "react-redux";

import {match} from "react-router";

import {ListStyle} from "../store/global/types";

import {makeGroupKey} from "../store/entries";
import {ProfileFilter} from "../store/global/types";

import BaseComponent from "../components/base";
import Meta from "../components/meta";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import NotFound from "../components/404";
import LinearProgress from "../components/linear-progress/index";
import EntryListLoadingItem from "../components/entry-list-loading-item";
import DetectBottom from "../components/detect-bottom";
import EntryListContent from "../components/entry-list";
import ProfileCard from "../components/profile-card";
import ProfileMenu from "../components/profile-menu";
import ProfileCover from "../components/profile-cover";
import ProfileCommunities from "../components/profile-communities";
import ProfileSettings from "../components/profile-settings";
import WalletHive from "../components/wallet-hive";
import WalletEcency from "../components/wallet-ecency";
import ScrollToTop from "../components/scroll-to-top";

import {getAccountFull} from "../api/hive";

import defaults from "../constants/defaults.json";

import _c from "../util/fix-class-names";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";
import {History} from "history";

interface MatchParams {
    username: string;
    section?: string;
}

interface Props extends PageProps {
    match: match<MatchParams>;
    history: History;
}

interface State {
    loading: boolean;
    isDefaultPost:boolean;
}

class ProfilePage extends BaseComponent<Props, State> {
    state: State = {
        loading: false,
        isDefaultPost:false
    };

    async componentDidMount() {
        await this.ensureAccount();

        const {match, global, fetchEntries, fetchTransactions, fetchPoints} = this.props;
        const {username, section} = match.params

        if (!section || (section && Object.keys(ProfileFilter).includes(section))) {
            // fetch posts
            fetchEntries(global.filter, global.tag, false);
        }

        // fetch wallet transactions
        fetchTransactions(username);

        // fetch points
        fetchPoints(username);
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        const {match, global, fetchEntries, fetchTransactions, resetTransactions, fetchPoints, resetPoints, history } = this.props;
        const {match: prevMatch, entries} = prevProps;

        const {username, section} = match.params;
        const { isDefaultPost } = this.state;

        // username changed. re-fetch wallet transactions and points
        if (username !== prevMatch.params.username) {
            this.ensureAccount().then(() => {
                resetTransactions();
                fetchTransactions(username);

                resetPoints();
                fetchPoints(username);
            });
        }

        // Wallet and points are not a correct filter to fetch posts
        if (section && !Object.keys(ProfileFilter).includes(section)) {
            return;
        }

        // filter or username changed. fetch posts.
        if (section !== prevMatch.params.section || username !== prevMatch.params.username) {
            fetchEntries(global.filter, global.tag, false);
        }

        if(entries){
        const { filter, tag } = global;
        const groupKey = makeGroupKey(filter, tag);
        const prevData = entries[groupKey];
        if(prevData){
        const data = this.props.entries[groupKey];
        const { loading } = data;
        const { loading: prevLoading } = prevData;
        if(loading !== prevLoading && !loading && data.entries.length === 0 && groupKey === `blog-${username}` && !isDefaultPost){
            this.setState({isDefaultPost:true})
            history.push(`/${username}/posts`);}
        }}
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        const {resetTransactions, resetPoints} = this.props;

        // reset transactions and points on unload
        resetTransactions();
        resetPoints();
    }

    ensureAccount = () => {
        const {match, accounts, addAccount} = this.props;

        const username = match.params.username.replace("@", "");
        const account = accounts.find((x) => x.name === username);

        if (!account) {
            // The account isn't in reducer. Fetch it and add to reducer.
            this.stateSet({loading: true});

            return getAccountFull(username).then(data => {
                if (data.name === username) {
                    addAccount(data);
                }
            }).finally(() => {
                this.stateSet({loading: false});
            });
        } else {
            // The account is in reducer. Update it.
            return getAccountFull(username).then(data => {
                if (data.name === username) {
                    addAccount(data);
                }
            })
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

    reload = () => {
        const {match, global, invalidateEntries, fetchEntries, resetTransactions, fetchTransactions, resetPoints, fetchPoints} = this.props;
        const {username, section} = match.params

        this.stateSet({loading: true});
        this.ensureAccount().then(() => {
            // reload transactions
            resetTransactions();
            fetchTransactions(username);

            // reload points
            resetPoints();
            fetchPoints(username);

            if (!section || (section && Object.keys(ProfileFilter).includes(section))) {
                // reload posts
                invalidateEntries(makeGroupKey(global.filter, global.tag));
                fetchEntries(global.filter, global.tag, false);
            }
        }).finally(() => {
            this.stateSet({loading: false});
        });
    }

    render() {
        const {global, entries, accounts, match} = this.props;
        const {loading} = this.state;
        const navBar = global.isElectron ? NavBarElectron({
            ...this.props,
            reloadFn: this.reload,
            reloading: loading,
        }) : NavBar({...this.props});

        if (loading) {
            return <>{navBar}<LinearProgress/></>;
        }

        const username = match.params.username.replace("@", "");
        const {section = ProfileFilter.blog} = match.params;
        const account = accounts.find((x) => x.name === username);

        if (!account) {
            return NotFound({...this.props});
        }

        //  Meta config
        const url = `${defaults.base}/@${username}${section ? `/${section}` : ""}`;
        const metaProps = account.__loaded ? {
            title: `${account.profile?.name || account.name}'s ${section ? `${section}` : ""} on decentralized web`,
            description: `${account.profile?.about ? `${account.profile?.about} ${section ? `${section}` : ""}` : `${(account.profile?.name || account.name)} ${section ? `${section}` : ""}`}` || "",
            url: `/@${username}${section ? `/${section}` : ""}`,
            canonical: url,
            image: `${defaults.imageServer}/u/${username}/avatar/medium`,
            rss: `${defaults.base}/@${username}/rss`,
            keywords: `${username}, ${username}'s blog`,
        } : {};

        const {filter, tag} = global;
        const groupKey = makeGroupKey(filter, tag);
        const data = entries[groupKey];
        let containerClasses = global.isElectron ? "app-content profile-page mt-0 pt-6" : "app-content profile-page";

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {navBar}

                <div className={containerClasses}>
                    <div className="profile-side">
                        {ProfileCard({
                            ...this.props,
                            account,
                            section
                        })}
                    </div>
                    <span itemScope={true} itemType="http://schema.org/Person">
                        {account.__loaded && <meta itemProp="name" content={account.profile?.name || account.name}/>}
                    </span>
                    <div className="content-side">
                        {ProfileMenu({
                            ...this.props,
                            username,
                            section
                        })}
                        {[...Object.keys(ProfileFilter), "communities"].includes(section) && ProfileCover({
                            ...this.props,
                            account
                        })}
                        {(() => {

                            if (section === "wallet") {
                                return WalletHive({
                                    ...this.props,
                                    account
                                });
                            }

                            if (section === "points") {
                                return WalletEcency({
                                    ...this.props,
                                    account
                                });
                            }

                            if (section === "communities") {
                                return ProfileCommunities({
                                    ...this.props,
                                    account
                                })
                            }

                            if (section === "settings") {
                                return ProfileSettings({
                                    ...this.props,
                                    account
                                })
                            }


                            if (data !== undefined) {
                                const entryList = data?.entries;
                                const loading = data?.loading;
                                return (
                                    <>
                                        <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
                                            <div className={_c(`entry-list-body ${global.listStyle === ListStyle.grid ? "grid-view" : ""}`)}>
                                                {loading && entryList.length === 0 && <EntryListLoadingItem/>}
                                                {EntryListContent({...this.props, entries: entryList, promotedEntries: [], loading})}
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
