import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import { AppState } from "../store";
import { EntryFilter, ListStyle, State as GlobalState } from "../store/global/types";
import { Account } from "../store/accounts/types";
import { State as TrendingTagsState } from "../store/trending-tags/types";
import { State as EntriesState } from "../store/entries/types";
import { State as CommunityState } from "../store/community/types";

import { hideIntro, toggleListStyle, toggleTheme } from "../store/global/index";
import { makeGroupKey, fetchEntries } from "../store/entries/index";
import { fetchCommunity, resetCommunity } from "../store/community/index";
import { fetchTrendingTags } from "../store/trending-tags";
import { addAccount } from "../store/accounts/index";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import Intro from "../components/intro/index";
import DropDown from "../components/dropdown/index";
import ListStyleToggle from "../components/list-style-toggle/index";
import LinearProgress from "../components/linear-progress/index";
import EntryListLoadingItem from "../components/entry-list-loading-item/index";
import DetectBottom from "../components/detect-bottom/index";
import EntryListContent from "../components/entry-list/index";
import TrendingTagsCard from "../components/trending-tags-card";
import CommunityCard from "../components/community-card";
import CommunityCardSm from "../components/community-card-sm";

import { _t } from "../i18n";

import _c from "../util/fix-class-names";
import capitalize from "../util/capitalize";

import defaults from "../constants/defaults.json";

interface Props {
  history: History;
  location: Location;
  global: GlobalState;
  trendingTags: TrendingTagsState;
  entries: EntriesState;
  community: CommunityState | null;
  toggleTheme: () => void;
  hideIntro: () => void;
  toggleListStyle: () => void;
  fetchEntries: (what: string, tag: string, more: boolean) => void;
  fetchCommunity: () => void;
  resetCommunity: () => void;
  fetchTrendingTags: () => void;
  addAccount: (data: Account) => void;
}

class EntryIndexPage extends Component<Props> {
  componentDidMount() {
    const { global, fetchEntries, fetchTrendingTags, fetchCommunity } = this.props;
    fetchEntries(global.filter, global.tag, false);
    fetchTrendingTags();
    fetchCommunity();
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { global, fetchEntries, fetchCommunity } = this.props;
    const { global: pGlobal } = prevProps;

    // page changed.
    if (!global.filter) {
      return;
    }

    if (!(global.filter === pGlobal.filter && global.tag === pGlobal.tag)) {
      fetchEntries(global.filter, global.tag, false);
    }

    if (global.tag !== pGlobal.tag) {
      fetchCommunity();
    }
  }

  componentWillUnmount() {
    const { resetCommunity } = this.props;
    resetCommunity();
  }

  bottomReached = () => {
    const { global, entries, fetchEntries } = this.props;
    const { filter, tag } = global;
    const groupKey = makeGroupKey(filter, tag);

    const data = entries[groupKey];
    const { loading, hasMore } = data;

    if (!loading && hasMore) {
      fetchEntries(filter, tag, true);
    }
  };

  render() {
    const { global, entries, community } = this.props;
    const { filter, tag } = global;

    const groupKey = makeGroupKey(filter, tag);

    const data = entries[groupKey];
    if (data === undefined) {
      return null;
    }

    const entryList = data.entries;
    const loading = data.loading;

    const dropDownConfig = {
      label: _t(`entry-index.filter-${filter}`),
      items: [EntryFilter.trending, EntryFilter.hot, EntryFilter.created].map((x) => {
        return {
          label: _t(`entry-index.filter-${x}`),
          href: tag ? `/${x}/${tag}` : `/${x}`,
          active: filter === x,
        };
      }),
    };

    //  Meta config
    const fC = capitalize(filter);
    let title = _t("entry-index.title", { f: fC });
    let description = _t("entry-index.description", { f: fC });
    let url = `${defaults.base}/${filter}`;
    let rss = "";

    if (tag) {
      url = `${defaults.base}/${filter}/${tag}`;
      rss = `${defaults.base}/${filter}/${tag}/rss.xml`;

      if (community) {
        title = `${community.title.trim()} / ${filter}`;
        description = _t("entry-index.description", { f: `${fC} ${community.title.trim()}` });
      } else {
        title = `#${tag} / ${filter}`;
        description = _t("entry-index.description-tag", { f: fC, t: tag });
      }
    }

    const metaProps = { title, description, url, rss };

    return (
      <>
        <Meta {...metaProps} />

        <Theme {...this.props} />
        <NavBar {...this.props} />
        <Intro {...this.props} />
        <div className="app-content entry-index-page">
          <div className="tags-side">
            <TrendingTagsCard {...this.props} />
          </div>
          <div className={_c(`entry-page-content ${loading ? "loading" : ""}`)}>
            {community && (
              <div className="community-sm">
                <CommunityCardSm {...this.props} community={community} />
              </div>
            )}
            <div className="page-tools">
              <DropDown {...{ ...this.props, ...dropDownConfig }} />
              <ListStyleToggle {...this.props} />
            </div>
            {loading && entryList.length === 0 ? <LinearProgress /> : ""}
            <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
              <div className={_c(`entry-list-body ${global.listStyle === ListStyle.grid ? "grid-view" : ""}`)}>
                {loading && entryList.length === 0 && <EntryListLoadingItem />}
                <EntryListContent {...this.props} entries={entryList} />
              </div>
            </div>
            {loading && entryList.length > 0 ? <LinearProgress /> : ""}
          </div>
          {community && (
            <div className="community-side">
              <CommunityCard {...this.props} community={community} />
            </div>
          )}
        </div>
        <DetectBottom onBottom={this.bottomReached} />
      </>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global,
  trendingTags: state.trendingTags,
  entries: state.entries,
  community: state.community,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      toggleTheme,
      hideIntro,
      toggleListStyle,
      fetchEntries,
      fetchCommunity,
      resetCommunity,
      fetchTrendingTags,
      addAccount,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EntryIndexPage);
