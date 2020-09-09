import React, {Component} from "react";

import {connect} from "react-redux";

import {History} from "history";

import {Link} from "react-router-dom";

import {EntryFilter, ListStyle} from "../store/global/types";

import {makeGroupKey} from "../store/entries";

import Meta from "../components/meta";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import Intro from "../components/intro";
import DropDown, {MenuItem} from "../components/dropdown";
import ListStyleToggle from "../components/list-style-toggle";
import LinearProgress from "../components/linear-progress";
import EntryListLoadingItem from "../components/entry-list-loading-item";
import DetectBottom from "../components/detect-bottom";
import EntryListContent from "../components/entry-list";
import TrendingTagsCard from "../components/trending-tags-card";

import {_t} from "../i18n";

import _c from "../util/fix-class-names";

import capitalize from "../util/capitalize";

import defaults from "../constants/defaults.json";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";


class EntryIndexPage extends Component<PageProps> {
    componentDidMount() {
        const {global, fetchEntries} = this.props;
        fetchEntries(global.filter, global.tag, false);
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
        const {filter, tag} = global;
        const groupKey = makeGroupKey(filter, tag);

        const data = entries[groupKey];
        const {loading, hasMore} = data;

        if (!loading && hasMore) {
            fetchEntries(filter, tag, true);
        }
    };

    render() {
        const {global, entries, activeUser} = this.props;
        const {filter, tag} = global;

        const groupKey = makeGroupKey(filter, tag);

        const data = entries[groupKey];
        if (data === undefined) {
            return null;
        }

        const entryList = data.entries;
        const loading = data.loading;

        const menuConfig: {
            history: History,
            label: string,
            items: MenuItem[]
        } = {
            history: this.props.history,
            label: _t(`entry-index.filter-${filter}`),
            items: [
                ...(activeUser
                    ? [
                        {
                            label: _t("entry-filter.filter-feed"),
                            href: `/@${activeUser.username}/feed`,
                            active: filter === "feed" && activeUser.username === tag.replace("@", ""),
                        },
                    ]
                    : []),
                ...[EntryFilter.trending, EntryFilter.hot, EntryFilter.created].map((x) => {
                    return {
                        label: _t(`entry-filter.filter-${x}`),
                        href: tag && filter !== "feed" ? `/${x}/${tag}` : `/${x}`,
                        active: filter === x,
                    };
                }),
            ],
        };

        //  Meta config
        const fC = capitalize(filter);
        let title = _t("entry-index.title", {f: fC});
        let description = _t("entry-index.description", {f: fC});
        let url = `${defaults.base}/${filter}`;
        let rss = "";

        if (tag) {
            if (tag.startsWith('@')) {
                title = `${tag} / ${filter}`;
                description = _t("entry-index.description-user-feed", {u: tag});
            } else {
                title = `#${tag} / ${filter}`;
                description = _t("entry-index.description-tag", {f: fC, t: tag});

                url = `${defaults.base}/${filter}/${tag}`;
                rss = `${defaults.base}/${filter}/${tag}/rss.xml`;
            }
        }

        const metaProps = {title, description, url, rss};

        const promoted = entries['__promoted__'].entries;

        return (
            <>
                <Meta {...metaProps} />

                <Theme global={this.props.global}/>
                <Feedback/>
                {NavBar({...this.props})}
                <Intro global={this.props.global} hideIntro={this.props.hideIntro}/>
                <div className="app-content entry-index-page">
                    <div className="tags-side">
                        {TrendingTagsCard({...this.props})}
                    </div>
                    <div className={_c(`entry-page-content ${loading ? "loading" : ""}`)}>
                        <div className="page-tools">
                            <div className="sm-menu">
                                <DropDown {...menuConfig} float="left"/>
                            </div>
                            <div className="lg-menu">
                                <ul className="nav nav-pills nav-fill">
                                    {menuConfig.items.map((i, k) => {
                                        return <li key={k} className="nav-item">
                                            <Link to={i.href!} className={`nav-link ${i.active ? "active" : ""}`}>{i.label}</Link>
                                        </li>
                                    })}
                                </ul>
                            </div>
                            <ListStyleToggle global={this.props.global} toggleListStyle={this.props.toggleListStyle}/>
                        </div>
                        {loading && entryList.length === 0 ? <LinearProgress/> : ""}
                        <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
                            <div className={_c(`entry-list-body ${global.listStyle === ListStyle.grid ? "grid-view" : ""}`)}>
                                {loading && entryList.length === 0 && <EntryListLoadingItem/>}
                                {EntryListContent({...this.props, entries: entryList, promotedEntries: promoted})}
                            </div>
                        </div>
                        {loading && entryList.length > 0 ? <LinearProgress/> : ""}
                    </div>
                </div>
                <DetectBottom onBottom={this.bottomReached}/>
            </>
        );
    }
}


export default connect(pageMapStateToProps, pageMapDispatchToProps)(EntryIndexPage);
