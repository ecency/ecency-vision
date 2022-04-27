import React, {Component} from "react";

import {connect} from "react-redux";

import { Redirect } from "react-router-dom";

import { ListStyle } from "../store/global/types";

import { makeGroupKey } from "../store/entries";

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
import LandingPage from "../components/landing-page";

import { _t } from "../i18n";

import _c from "../util/fix-class-names";

import capitalize from "../util/capitalize";

import defaults from "../constants/defaults.json";

import {
  pageMapDispatchToProps,
  pageMapStateToProps,
  PageProps,
} from "./common";
import { getCommunities } from "../api/bridge";
import { Community } from "../store/communities/types";

interface State {
  step: number;
  community: string;
  communities: Community[]
}

class EntryIndexPage extends Component<PageProps, State> {
  state: State = {
    step: 1,
    community: "",
    communities: [],
  };

  componentDidMount() {
    const { global, fetchEntries, fetchTrendingTags } = this.props;
    fetchEntries(global.filter, global.tag, false);
    fetchTrendingTags();
    const community = global.hive_id;

    if (community) {
      this.setState({ ...this.state, community });
    }

    getCommunities().then(r => {
      if (r) {
        this.setState({ ...this.state, communities: r })
      }
    })

    this.props.activeUser !== null
      ? this.changeStepTwo()
      : this.changeStepOne();
  }

  componentDidUpdate(prevProps: Readonly<PageProps>): void {
    const { global, fetchEntries, activeUser } = this.props;
    const { global: pGlobal, activeUser: pActiveUser } = prevProps;

    // page changed.
    if (!global.filter) {
      return;
    }

    if (!(global.filter === pGlobal.filter && global.tag === pGlobal.tag)) {
      fetchEntries(global.filter, global.tag, false);
    } else if (pActiveUser?.username !== activeUser?.username) {
      this.reload();
    }
  }

  bottomReached = () => {
    const { global, entries, fetchEntries } = this.props;
    const { step } = this.state;
    const { filter, tag } = global;
    const groupKey = makeGroupKey(filter, tag);

    const data = entries[groupKey];
    const { loading, hasMore } = data;

    if (!loading && hasMore && step === 2) {
      fetchEntries(filter, tag, true);
    }
  };

  reload = () => {
    const { global, fetchEntries, invalidateEntries } = this.props;
    invalidateEntries(makeGroupKey(global.filter, global.tag));
    fetchEntries(global.filter, global.tag, false);
  };

  changeStepOne = () => {
    this.setState({
      step: 1,
    });
  };

  changeStepTwo = () => {
    this.setState({
      step: 2,
    });
  };

  render() {
    const { global, activeUser, entries, location } = this.props;
    const { communities } = this.state;
    const { filter, tag } = global;

    const groupKey = makeGroupKey(filter, tag);

    const data = entries[groupKey];
    if (data === undefined) {
      return null;
    }

    const entryList = data.entries;
    const loading = data.loading;

    //  Meta config
    const fC = capitalize(filter);
    const community = communities.find(community => community.name === global.hive_id) ? communities.find(community => community.name === global.hive_id) : { title: '', name: '' }
    const title = `${community!.title.trim()} community`;
    const description = _t("community.page-description", {
      f: `${fC} ${community!.title.trim()}`,
    });
    const url = `/${filter}/${global.hive_id}`;
    const rss = `${defaults.base}/${filter}/${global.hive_id}/rss.xml`;
    const image = `${defaults.imageServer}/u/${global.hive_id}/avatar/medium`;
    const canonical = `${defaults.base}/created/${global.hive_id}`;

    const metaProps = { title, description, url, rss, image, canonical };

    const promoted = entries["__promoted__"].entries;

    const showEntryPage =
      this.state.step === 2 ||
      // || activeUser !== null || activeUser === null
      location?.pathname?.startsWith("/hot") ||
      location?.pathname?.startsWith("/created") ||
      location?.pathname?.startsWith("/trending") ||
      location?.pathname?.startsWith("/payout") ||
      location?.pathname?.startsWith("/payout_comments");
    let containerClasses = global.isElectron
      ? "app-content entry-index-page mt-0 pt-6"
      : "app-content entry-index-page";

    return (
      <>
        {!!this.state.community && (
          <Redirect to={`/trending/${this.state.community}`} />
        )}
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <Feedback />
        {global.isElectron
          ? NavBarElectron({
              ...this.props,
              reloadFn: this.reload,
              reloading: loading,
              step: this.state.step,
              setStepTwo: this.changeStepTwo,
            })
          : NavBar({
              ...this.props,
              step: this.state.step,
              setStepOne: this.changeStepOne,
              setStepTwo: this.changeStepTwo,
            })}
        {this.state.step === 1 &&
          activeUser === null &&
          location &&
          "/" === location?.pathname && (
            <LandingPage {...this.props} changeState={this.changeStepTwo} />
          )}
        {showEntryPage && (
          <div className={containerClasses}>
            <div className="tags-side">
              {!global.isMobile && <>{TrendingTagsCard({ ...this.props })}</>}
            </div>
            <div
              className={_c(`entry-page-content ${loading ? "loading" : ""}`)}
            >
              <div className="page-tools">
                {EntryIndexMenu({ ...this.props })}
              </div>
              {loading && entryList.length === 0 ? <LinearProgress /> : ""}
              <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
                <div
                  className={_c(
                    `entry-list-body limited-area ${
                      global.listStyle === ListStyle.grid ? "grid-view" : ""
                    }`
                  )}
                >
                  {loading && entryList.length === 0 && (
                    <EntryListLoadingItem />
                  )}
                  {EntryListContent({
                    ...this.props,
                    entries: entryList,
                    promotedEntries: promoted,
                    loading,
                  })}
                </div>
              </div>
              {loading && entryList.length > 0 ? <LinearProgress /> : ""}
            </div>
            <div className="side-menu">
              {!global.isMobile && (
                <>{1 !== this.state.step && <MarketData global={global} />}</>
              )}
            </div>
          </div>
        )}
        <DetectBottom onBottom={this.bottomReached} />
      </>
    );
  }
}


export default connect(pageMapStateToProps, pageMapDispatchToProps)(EntryIndexPage);
