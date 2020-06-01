import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import { AppState } from "../store";
import { Filter, ListStyle, State as GlobalState } from "../store/global/types";
import { State as TrendingTagsState } from "../store/trending-tags/types";
import { State as EntriesState } from "../store/entries/types";
import { State as CommunityState } from "../store/community/types";

import { hideIntro, toggleListStyle, toggleTheme } from "../store/global/index";
import { makeGroupKey, fetchEntries } from "../store/entries/index";
import { fetchCommunity } from "../store/community/index";

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

interface Props {
  history: History;
  location: Location;
  global: GlobalState;
  entries: EntriesState;
  toggleTheme: () => void;
  toggleListStyle: () => void;
  fetchEntries: (what: string, tag: string, more: boolean) => void;
}

class ProfilePage extends Component<Props> {
  componentDidUpdate(prevProps: Readonly<Props>): void {
    /*
    const { global, fetchEntries, fetchCommunity } = this.props;
    const { global: pGlobal } = prevProps;

    if (!(global.filter === pGlobal.filter && global.tag === pGlobal.tag)) {
      fetchEntries(global.filter, global.tag, false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    if (global.tag !== pGlobal.tag) {
      fetchCommunity();
    }*/
  }

  bottomReached = () => {
    return true;
  };

  render() {
    const { global, entries } = this.props;
    const { filter, tag } = global;

    const groupKey = makeGroupKey(filter, tag);

    const data = entries[groupKey];
    if (data === undefined) {
      // return null;
    }

    const entryList = data?.entries;
    const loading = data?.loading;

    //  Meta config
    const metaProps = {};

    return (
      <>
        <Meta {...metaProps} />
        <Theme {...this.props} />
        <NavBar {...this.props} />

        <div className="app-content"></div>
        <DetectBottom onBottom={this.bottomReached} />
      </>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global,
  entries: state.entries,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      toggleTheme,
      toggleListStyle,
      fetchEntries,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
