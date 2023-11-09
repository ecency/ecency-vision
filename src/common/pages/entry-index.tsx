import React, { Component } from "react";
import { ListStyle } from "../store/global/types";
import { makeGroupKey } from "../store/entries";
import EntryIndexMenu from "../components/entry-index-menu";
import LinearProgress from "../components/linear-progress";
import EntryListLoadingItem from "../components/entry-list-loading-item";
import DetectBottom from "../components/detect-bottom";
import EntryListContent from "../components/entry-list";
import TrendingTagsCard from "../components/trending-tags-card";
import MarketData from "../components/market-data";
import _c from "../util/fix-class-names";
import { PageProps } from "./common";
import { Entry } from "../store/entries/types";
import { TopCommunitiesWidget } from "../components/top-communities-widget";
import * as ls from "../util/local-storage";
import "./entry-index.scss";

interface Props extends PageProps {
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
  reload: () => void;
}

interface State {
  entryList: Entry[];
  promoted: Entry[];
  noReblog: boolean;
}

class EntryIndexPage extends Component<Props, State> {
  state: State = {
    entryList: [],
    promoted: [],
    noReblog: false
  };

  componentDidMount() {
    const { global, fetchEntries, fetchTrendingTags } = this.props;
    fetchEntries(global.filter, global.tag, false);
    fetchTrendingTags();
    this.loadEntries();

    const filterReblog: any = ls.get("my_reblog");
    this.setState({ noReblog: filterReblog });
  }

  componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<State>): void {
    const { global, fetchEntries, activeUser } = this.props;
    const { global: pGlobal, activeUser: pActiveUser, entries: pEntries } = prevProps;

    ls.set("my_reblog", this.state.noReblog);

    if (prevState.noReblog !== this.state.noReblog) {
      if (this.state.noReblog === true) {
        this.loadEntries();
      } else {
        this.props.reload();
      }
      return;
    }
    // page changed.
    if (!global.filter) {
      return;
    }

    if (!(global.filter === pGlobal.filter && global.tag === pGlobal.tag)) {
      fetchEntries(global.filter, global.tag, false);
    } else if (pActiveUser?.username !== activeUser?.username) {
      this.props.reload();
    }

    if (this.props.entries !== pEntries) {
      this.loadEntries();
    }
  }
  handleFilterReblog = () => {
    this.setState((prevState) => {
      return { ...prevState, noReblog: !prevState.noReblog };
    });
  };

  loadEntries = () => {
    const { entries, global } = this.props;
    const { filter, tag } = global;

    const groupKey = makeGroupKey(filter, tag);

    let data = entries[groupKey];
    if (data === undefined) {
      return;
    }
    if (this.state.noReblog === true) {
      data.entries = data?.entries?.filter((entry) => {
        return !entry?.reblogged_by?.length;
      });
    }
    this.setState({
      entryList: data.entries,
      promoted: entries["__promoted__"].entries
    });

    if (this.props.loading !== data.loading) {
      this.props.setLoading(data.loading);
    }
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
    const { entryList, promoted } = this.state;
    const { global } = this.props;

    return (
      <>
        <div className="app-content overflow-hidden entry-index-page">
          <div className="tags-side">
            {!global.isMobile && <>{TrendingTagsCard({ ...this.props })}</>}
          </div>
          <div className={_c(`entry-page-content ${this.props.loading ? "loading" : ""}`)}>
            <div className="page-tools">
              {EntryIndexMenu({
                ...this.props,
                handleFilterReblog: this.handleFilterReblog,
                noReblog: this.state.noReblog
              })}
            </div>
            {this.props.loading && entryList.length === 0 ? <LinearProgress /> : ""}
            <div className={_c(`entry-list ${this.props.loading ? "loading" : ""}`)}>
              <div
                className={_c(
                  `entry-list-body limited-area ${
                    global.listStyle === ListStyle.grid ? "grid-view" : ""
                  }`
                )}
              >
                {this.props.loading && entryList.length === 0 && <EntryListLoadingItem />}
                {EntryListContent({
                  ...this.props,
                  entries: entryList,
                  promotedEntries: promoted,
                  loading: this.props.loading
                })}
              </div>
            </div>
            {this.props.loading && entryList.length > 0 ? <LinearProgress /> : ""}
          </div>
          <div className="side-menu">
            {!global.isMobile && <MarketData global={global} />}
            {!global.isMobile && <TopCommunitiesWidget {...this.props} />}
          </div>
        </div>
        <DetectBottom onBottom={this.bottomReached} />
      </>
    );
  }
}

export default (props: Props) => <EntryIndexPage {...props} />;
