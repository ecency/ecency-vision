import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import { Helmet } from "react-helmet";

import { Button } from "react-bootstrap";

import { AppState } from "../store";
import { Filter, ListStyle, State as GlobalState } from "../store/global/types";
import { State as TrendingTagsState } from "../store/trending-tags/types";
import { State as EntriesState } from "../store/entries/types";
import { Community } from "../store/communities/types";

import { hideIntro, toggleListStyle, toggleTheme } from "../store/global/index";
import { makeGroupKey, fetchEntries } from "../store/entries/index";

import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import Intro from "../components/intro/index";
import TagLink, { makePath } from "../components/tag-link/index";
import DropDown from "../components/dropdown/index";
import ListStyleToggle from "../components/list-style-toggle/index";
import LinearProgress from "../components/linear-progress/index";
import EntryListLoadingItem from "../components/entry-list-loading-item/index";
import DetectBottom from "../components/detect-bottom/index";
import EntryListContent from "../components/entry-list/index";
import DownloadTrigger from "../components/download-trigger";

import { getCommunity } from "../api/hive";

import { _t } from "../i18n";

import _c from "../util/fix-class-names";

import ln2list from "../util/nl2list";

import { accountGroupSvg } from "../../svg";

const filters = Object.values(Filter);

interface Props {
  history: History;
  location: Location;
  global: GlobalState;
  trendingTags: TrendingTagsState;
  entries: EntriesState;
  toggleTheme: () => void;
  hideIntro: () => void;
  toggleListStyle: () => void;
  fetchEntries: (what: string, tag: string, more: boolean) => void;
}

interface State {
  community: Community | null;
}

class EntryIndexPage extends Component<Props, State> {
  state: State = {
    community: null,
  };

  componentDidMount() {
    this.detectCommunity();
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { global, fetchEntries } = this.props;
    const { global: pGlobal } = prevProps;

    if (!(global.filter === pGlobal.filter && global.tag === pGlobal.tag)) {
      fetchEntries(global.filter, global.tag, false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    if (global.tag !== pGlobal.tag) {
      this.detectCommunity();
    }
  }

  detectCommunity = () => {
    const { global } = this.props;

    if (!global.tag.startsWith("hive-")) {
      this.setState({ community: null });
      return;
    }

    getCommunity(global.tag).then((community) => {
      this.setState({ community });
    });
  };

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
    const { trendingTags, global, entries } = this.props;
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

    const { community } = this.state;

    return (
      <>
        <Helmet>
          <title>Home</title>
        </Helmet>
        <Theme {...this.props} />
        <NavBar {...this.props} />
        <Intro {...this.props} />
        <div className="app-content">
          <div className="trending-tag-list">
            <h2 className="list-header">Popular Tags</h2>
            {trendingTags.list.map((t) => {
              const cls = _c(
                `tag-list-item ${global.tag === t ? "selected-item" : ""}`
              );
              return (
                <TagLink {...this.props} tag={t} key={t}>
                  <a href={makePath(global.filter, t)} className={cls}>
                    {t}
                  </a>
                </TagLink>
              );
            })}
          </div>
          <div className={_c(`entry-page-content ${loading ? "loading" : ""}`)}>
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
            <div className="community-card">
              <h2 className="community-title">
                {accountGroupSvg} {community.title}
              </h2>

              <div className="community-panel">
                <div className="community-about">{community.about}</div>

                <div className="community-stats">
                  <div className="community-stat">
                    <span className="stat-text">
                      {community.subscribers} subscribers
                    </span>
                  </div>

                  <div className="community-stat">
                    <span className="stat-text">
                      {community.sum_pending} pending rewards
                    </span>
                  </div>

                  <div className="community-stat">
                    <span className="stat-text">
                      {community.num_authors} active posters
                    </span>
                  </div>
                </div>

                <DownloadTrigger>
                  <Button variant="primary" block={true}>
                    Subscribe
                  </Button>
                </DownloadTrigger>
                <DownloadTrigger>
                  <Button variant="primary" block={true}>
                    New Post
                  </Button>
                </DownloadTrigger>
              </div>

              <div className="community-panel">
                <div className="community-section">
                  <h4 className="section-header">Description</h4>
                  {ln2list(community.description).map((x) => (
                    <p>{x}</p>
                  ))}
                </div>

                <div className="community-section">
                  <h4 className="section-header">Rules</h4>
                  <ol>
                    {ln2list(community.flag_text).map((x) => (
                      <li>{x}</li>
                    ))}
                  </ol>
                </div>

                <div className="community-section">
                  <h4 className="section-header">Language</h4>
                  {community.lang}
                </div>
              </div>
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
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      toggleTheme,
      hideIntro,
      toggleListStyle,
      fetchEntries,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(EntryIndexPage);
