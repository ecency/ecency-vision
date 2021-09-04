import React from "react";
import {connect} from "react-redux";
import {match} from "react-router";

import {Alert} from "react-bootstrap";

import {ListStyle} from "../store/global/types";
import {EntryFilter} from "../store/global/types";
import {makeGroupKey} from "../store/entries";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

import BaseComponent from "../components/base";
import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import LinearProgress from "../components/linear-progress";
import CommunityCard from "../components/community-card";
import CommunityMenu from "../components/community-menu";
import CommunityCover from "../components/community-cover";
import NotFound from "../components/404";
import Feedback from "../components/feedback";
import EntryListLoadingItem from "../components/entry-list-loading-item";
import EntryListContent from "../components/entry-list";
import DetectBottom from "../components/detect-bottom";
import CommunitySubscribers from "../components/community-subscribers";
import CommunityActivities from "../components/community-activities";
import CommunityRoles from "../components/community-roles";
import ScrollToTop from "../components/scroll-to-top";

import {getCommunity, getSubscriptions} from "../api/bridge";
import {getAccountFull} from "../api/hive";

import {_t} from "../i18n";

import _c from "../util/fix-class-names";
import capitalize from "../util/capitalize";

import defaults from "../constants/defaults.json";

interface MatchParams {
    filter: string;
    name: string;
}

interface Props extends PageProps {
    match: match<MatchParams>;
}

interface State {
    loading: boolean;
}

class CommunityPage extends BaseComponent<Props, State> {
    state: State = {
        loading: false
    };

    async componentDidMount() {
        await this.ensureData();
        const {match, fetchEntries} = this.props;

        const {filter, name} = match.params;
        if (EntryFilter[filter]) {
            // fetch blog posts.
            fetchEntries(filter, name, false);
        }

        // fetch subscriptions.
        const {activeUser, subscriptions, updateSubscriptions} = this.props;
        if (activeUser && subscriptions.length === 0) {
            getSubscriptions(activeUser.username).then(r => {
                if (r) updateSubscriptions(r);
            });
        }
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        const {match, fetchEntries} = this.props;
        const {match: prevMatch} = prevProps;

        const {filter, name} = match.params;
        const {params: prevParams} = prevMatch;

        // community changed. fetch community and account data.
        if (name !== prevParams.name) {
            this.ensureData().then();
        }

        //  community or filter changed
        if ((filter !== prevParams.filter || name !== prevParams.name) && EntryFilter[filter]) {
            fetchEntries(match.params.filter, match.params.name, false);
        }

        // re-fetch subscriptions once active user changed.
        const {activeUser, updateSubscriptions} = this.props;
        if (prevProps.activeUser?.username !== activeUser?.username) {
            if (activeUser) {
                getSubscriptions(activeUser.username).then(r => {
                    if (r) updateSubscriptions(r);
                });
            }
        }
    }

    ensureData = (): Promise<void> => {
        const {match, communities, addCommunity, accounts, addAccount, activeUser} = this.props;

        const name = match.params.name;
        const community = communities.find((x) => x.name === name);
        const account = accounts.find((x) => x.name === name);

        if (!community || !account) {
            // Community or account data aren't in reducer. Show loading indicator.
            this.stateSet({loading: true});
        }

        return getCommunity(name, activeUser?.username).then((data) => {
            if (data) {
                addCommunity(data);
            }
            return getAccountFull(name);
        }).then((data) => {
            if (data.name === name) {
                addAccount(data);
            }
        }).finally(() => {
            this.stateSet({loading: false});
        });
    }

    bottomReached = () => {
        const {match, entries, fetchEntries} = this.props;
        const {filter, name} = match.params;
        const groupKey = makeGroupKey(filter, name);

        const data = entries[groupKey];
        const {loading, hasMore} = data;

        if (!loading && hasMore) {
            fetchEntries(filter, name, true);
        }
    };

    reload = () => {
        this.stateSet({loading: true});
        this.ensureData().then(() => {
            const {match, fetchEntries, invalidateEntries} = this.props;
            const {filter, name} = match.params;

            if (EntryFilter[filter]) {
                invalidateEntries(makeGroupKey(filter, name));
                fetchEntries(filter, name, false);
            }
        });
    }

    render() {
        const {global, entries, communities, accounts, match} = this.props;
        const {loading} = this.state;

        const navBar = global.isElectron ?
            NavBarElectron({
                ...this.props,
                reloadFn: this.reload,
                reloading: loading,
            }) :
            NavBar({...this.props})

        if (loading) {
            return <>{navBar}<LinearProgress/></>;
        }

        const {name, filter} = match.params;

        const community = communities.find((x) => x.name === name);
        const account = accounts.find((x) => x.name === name);

        if (!community || !account) {
            return NotFound({...this.props});
        }

        //  Meta config
        const fC = capitalize(filter);
        const title = `${community.title.trim()} community ${filter} list`;
        const description = _t("community.page-description", {f: `${fC} ${community.title.trim()}`});
        const url = `/${filter}/${community.name}`;
        const rss = `${defaults.base}/${filter}/${community.name}/rss.xml`;
        const image = `${defaults.imageServer}/u/${community.name}/avatar/medium`;
        const canonical = `${defaults.base}/created/${community.name}`;

        const metaProps = {title, description, url, rss, image, canonical};

        const promoted = entries['__promoted__'].entries;
        let containerClasses = global.isElectron ? "app-content community-page mt-0 pt-6" : "app-content community-page";

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {navBar}

                <div className={containerClasses}>
                    <div className="profile-side">
                        {CommunityCard({
                            ...this.props,
                            community,
                            account
                        })}
                    </div>
                    <span itemScope={true} itemType="http://schema.org/Organization">
                        <meta itemProp="name" content={community.title.trim() || community.name}/>
                        <span itemProp="logo" itemScope={true} itemType="http://schema.org/ImageObject">
                            <meta itemProp="url" content={image}/>
                        </span>
                        <meta itemProp="url" content={`${defaults.base}${url}`}/>
                    </span>
                    <div className="content-side">
                        {CommunityMenu({
                            ...this.props,
                            community
                        })}

                        {CommunityCover({
                            ...this.props,
                            account,
                            community
                        })}

                        {(() => {
                            if (filter === 'subscribers') {
                                return <CommunitySubscribers {...this.props} community={community}/>;
                            }

                            if (filter === 'activities') {
                                return <CommunityActivities {...this.props} community={community}/>;
                            }

                            if (filter === 'roles') {
                                return <CommunityRoles {...this.props} community={community}/>;
                            }

                            const groupKey = makeGroupKey(filter, name);
                            const data = entries[groupKey];

                            if (data !== undefined) {
                                const entryList = data?.entries;
                                const loading = data?.loading;

                                return (
                                    <>
                                        {!loading && entryList.length === 0 ? <Alert variant="info">{_t('g.empty-list')}</Alert> : ""}
                                        {loading && entryList.length === 0 ? <LinearProgress/> : ""}
                                        <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
                                            <div className={_c(`entry-list-body ${global.listStyle === ListStyle.grid ? "grid-view" : ""}`)}>
                                                {loading && entryList.length === 0 && <EntryListLoadingItem/>}
                                                {EntryListContent({...this.props, entries: entryList, promotedEntries: promoted, community, loading})}
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
        )
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(CommunityPage);
