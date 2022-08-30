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
import { DeckView } from "../components/deck-view";
import { Entry } from "../store/entries/types";
import { TopCommunitiesWidget } from "../components/top-communities-widget";

interface Props extends PageProps {
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
  reload: () => void;
}

interface State {
  entryList: Entry[];
  promoted: Entry[];
}

class EntryIndexPage extends Component<Props, State> {
  state: State = {
    entryList: [],
    promoted: []
  };

  componentDidMount() {
    const { global, fetchEntries, fetchTrendingTags } = this.props;
    fetchEntries(global.filter, global.tag, false);
    fetchTrendingTags();
    this.loadEntries();
  }

  componentDidUpdate(prevProps: Readonly<PageProps>): void {
    const { global, fetchEntries, activeUser } = this.props;
    const { global: pGlobal, activeUser: pActiveUser, entries: pEntries } = prevProps;

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

  loadEntries = () => {
    const { entries, global } = this.props;
    const { filter, tag } = global;
    const groupKey = makeGroupKey(filter, tag);
    const data = entries[groupKey];

    if (data === undefined) {
      return;
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

    let containerClasses;
    if (global.isElectron) {
      containerClasses = "app-content entry-index-page mt-0 pt-6";
    } else {
      containerClasses = "app-content overflow-hidden entry-index-page";
    }

    if (global.listStyle === ListStyle.deck) {
      containerClasses += " p-0 m-0 mw-100";
    }

    return (
      <>
        {
          <div className={containerClasses}>
            {global.listStyle === ListStyle.deck ? (
              <DeckView />
            ) : (
              <>
                <div className="tags-side">
                  {!global.isMobile && <>{TrendingTagsCard({ ...this.props })}</>}
                </div>
                <div className={_c(`entry-page-content ${this.props.loading ? "loading" : ""}`)}>
                  <div className="page-tools">{EntryIndexMenu({ ...this.props })}</div>
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
              </>
            )}
          </div>
        }
        <DetectBottom onBottom={this.bottomReached} />
      </>
    );
  }
}

export default (props: Props) => <EntryIndexPage {...props} />;
