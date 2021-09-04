import React, {Component} from "react";

import {connect} from "react-redux";

import {Link} from "react-router-dom";

import {ListStyle} from "../store/global/types";

import {makeGroupKey} from "../store/entries";

import Meta from "../components/meta";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import EntryIndexMenu from "../components/entry-index-menu";
import LinearProgress from "../components/linear-progress";
import EntryListLoadingItem from "../components/entry-list-loading-item";
import DetectBottom from "../components/detect-bottom";
import EntryListContent from "../components/entry-list";
import TrendingTagsCard from "../components/trending-tags-card";
import ScrollToTop from "../components/scroll-to-top";
import MarketData from "../components/market-data";
import DownloadTrigger from "../components/download-trigger";
import LandingPage from "../components/landing-page";

import {_t} from "../i18n";

import _c from "../util/fix-class-names";

import capitalize from "../util/capitalize";

import defaults from "../constants/defaults.json";

import {appleSvg, desktopSvg, googleSvg} from "../img/svg";

import {pageMapDispatchToProps, pageMapStateToProps, PageProps} from "./common";

interface State {
    step: number;
}

class EntryIndexPage extends Component<PageProps, State> {
    state:State = {
        step: 1,
    }

    componentDidMount() {
        const {global, fetchEntries} = this.props;
        fetchEntries(global.filter, global.tag, false);
        this.props.activeUser !== null ? this.changeStepTwo() :this.changeStepOne() 
    }

    componentDidUpdate(prevProps: Readonly<PageProps>): void {
        const {global, fetchEntries} = this.props;
        const {global: pGlobal} = prevProps;

        // page changed.
        if (!global.filter) {
            return;
        }

        if (!(global.filter === pGlobal.filter && global.tag === pGlobal.tag)) {
            fetchEntries(global.filter, global.tag, false);
        }

    }

    bottomReached = () => {
        const {global, entries, fetchEntries} = this.props;
        const { step } = this.state;
        const {filter, tag} = global;
        const groupKey = makeGroupKey(filter, tag);

        const data = entries[groupKey];
        const {loading, hasMore} = data;

        if (!loading && hasMore && step === 2) {
            fetchEntries(filter, tag, true);
        }
    };

    reload = () => {
        const {global, fetchEntries, invalidateEntries} = this.props;
        invalidateEntries(makeGroupKey(global.filter, global.tag));
        fetchEntries(global.filter, global.tag, false);
    }

    changeStepOne = () => {
        this.setState({
            step: 1
        })
    }

    changeStepTwo = () => {
        this.setState({
            step: 2
        })
    }

    render() {
        const {global, activeUser, entries, location} = this.props;
        const {filter, tag} = global;

        const groupKey = makeGroupKey(filter, tag);

        const data = entries[groupKey];
        if (data === undefined) {
            return null;
        }

        const entryList = data.entries;
        const loading = data.loading;

        //  Meta config
        const fC = capitalize(filter);
        let title = _t("entry-index.title", {f: fC});
        let description = _t("entry-index.description", {f: fC});
        let url = `/${filter}`;
        let canonical = `${defaults.base}/${filter}`;
        let rss = "";

        if (tag) {
            if (activeUser && tag === "my") {
                title = `@${activeUser.username}'s community feed on decentralized web`;
                description = _t("entry-index.description-user-feed", {u: tag});
                canonical = `${defaults.base}/@${tag}/${filter}`;
            } else if (tag.startsWith('@')) {
                title = `${tag}'s ${filter} on decentralized web`;
                description = _t("entry-index.description-user-feed", {u: tag});
                canonical = `${defaults.base}/@${tag}/${filter}`;
            } else {
                title = `latest #${tag} ${filter} topics on internet`;
                description = _t("entry-index.description-tag", {f: fC, t: tag});

                url = `/${filter}/${tag}`;
                canonical = `${defaults.base}/${filter}/${tag}`;
                rss = `${defaults.base}/${filter}/${tag}/rss.xml`;
            }
        }

        const metaProps = {title, description, url, canonical, rss};

        const promoted = entries['__promoted__'].entries;

        const showEntryPage = this.state.step === 2 
        || activeUser !== null
        || location?.pathname?.startsWith("/hot")
        || location?.pathname?.startsWith("/created")
        || location?.pathname?.startsWith("/trending")
        || location?.pathname?.startsWith("/payout")
        || location?.pathname?.startsWith("/payout_comments");
        let containerClasses = global.isElectron ? "app-content entry-index-page mt-0 pt-6" : "app-content entry-index-page";
    
        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props,
                        reloadFn: this.reload,
                        reloading: loading,
                        step:this.state.step,
                        setStepTwo: this.changeStepTwo
                    }) :
                    NavBar({...this.props, step:this.state.step, setStepOne:this.changeStepOne, setStepTwo: this.changeStepTwo})}
                {
                    this.state.step === 1  &&
                    activeUser === null &&
                    location && "/" === location?.pathname &&
                    <LandingPage {...this.props} changeState={this.changeStepTwo}/>
                }
                {
                    showEntryPage && <div className={containerClasses}>
                        <div className="tags-side">
                            {!global.isMobile && (
                                <>
                                    {TrendingTagsCard({...this.props})}
                                </>
                            )}
                        </div>
                        <div className={_c(`entry-page-content ${loading ? "loading" : ""}`)}>
                            <div className="page-tools">
                                {EntryIndexMenu({...this.props})}
                            </div>
                            {loading && entryList.length === 0 ? <LinearProgress/> : ""}
                            <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
                                <div className={_c(`entry-list-body limited-area ${global.listStyle === ListStyle.grid ? "grid-view" : ""}`)}>
                                    {loading && entryList.length === 0 && <EntryListLoadingItem />}
                                    {EntryListContent({...this.props, entries: entryList, promotedEntries: promoted, loading})}
                                </div>
                            </div>
                            {loading && entryList.length > 0 ? <LinearProgress/> : ""}
                        </div>
                        <div className="side-menu">
                            {!global.isMobile && (
                                <>
                                    {1 !== this.state.step && <MarketData />}

                                    <div className="menu-nav">
                                        <DownloadTrigger>
                                            <div className="downloads">
                                                <span className="label">{_t("g.downloads")}</span>
                                                <span className="icons">
                                                    <span className="img-apple">{appleSvg}</span>
                                                    <span className="img-google">{googleSvg}</span>
                                                    <span className="img-desktop">{desktopSvg}</span>
                                                </span>
                                            </div>
                                        </DownloadTrigger>

                                        <div className="text-menu">
                                            <Link className="menu-item" to="/faq">
                                                {_t("entry-index.faq")}
                                            </Link>
                                            <Link className="menu-item" to="/terms-of-service">
                                                {_t("entry-index.tos")}
                                            </Link>
                                            <Link className="menu-item" to="/privacy-policy">
                                                {_t("entry-index.pp")}
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                }
                <DetectBottom onBottom={this.bottomReached}/>
            </>
        );
    }
}


export default connect(pageMapStateToProps, pageMapDispatchToProps)(EntryIndexPage);
