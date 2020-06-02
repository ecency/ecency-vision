import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import { AppState } from "../store";
import { Filter, ListStyle, State as GlobalState } from "../store/global/types";
import { Account } from "../store/accounts/types";
import { State as TrendingTagsState } from "../store/trending-tags/types";
import { State as EntriesState } from "../store/entries/types";
import { State as CommunityState } from "../store/community/types";

import { hideIntro, toggleListStyle, toggleTheme } from "../store/global/index";
import { makeGroupKey, fetchEntries } from "../store/entries/index";
import { fetchCommunity } from "../store/community/index";
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

const filters = Object.values(Filter);

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
  addAccount: (data: Account) => void;
}

class EntryIndexPage extends Component<Props> {
  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { global, fetchEntries, fetchCommunity } = this.props;
    const { global: pGlobal } = prevProps;

    // page changed.
    if (!global.filter) {
      return;
    }

    if (!(global.filter === pGlobal.filter && global.tag === pGlobal.tag)) {
      fetchEntries(global.filter, global.tag, false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    if (global.tag !== pGlobal.tag) {
      fetchCommunity();
    }
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
      items: filters.map((x) => {
        return {
          label: _t(`entry-index.filter-${x}`),
          href: tag ? `/${x}/${tag}` : `/${x}`,
          active: filter === x,
        };
      }),
    };

    //  Meta config
    const fC = filter.charAt(0).toUpperCase() + filter.slice(1).toLowerCase();
    const f_ = filter.toLowerCase();
    const t_ = tag.toLowerCase();

    let title = `${fC} topics`;
    let description = `${fC} topics`;
    let url = `https://ecency.com/${f_}`;

    if (tag) {
      if (community) {
        title = `${community.title} / ${f_}`;
        description = `${fC} ${community.title} topics`;
      } else {
        title = `#${t_} / ${f_}`;
        description = `${fC} topics with #${t_} tag`;
      }

      url = `https://ecency.com/${f_}/${t_}`;
    }

    const metaProps = { title, description, url };

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
              <div
                className={_c(
                  `entry-list-body ${
                    global.listStyle === ListStyle.grid ? "grid-view" : ""
                  }`
                )}
              >
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
      addAccount,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EntryIndexPage);
