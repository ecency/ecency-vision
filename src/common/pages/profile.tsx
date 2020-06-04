import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import { match } from "react-router";

import { AppState } from "../store";
import { Filter, ListStyle, State as GlobalState } from "../store/global/types";
import { State as TrendingTagsState } from "../store/trending-tags/types";
import { State as EntriesState } from "../store/entries/types";
import { Account, State as AccountsState } from "../store/accounts/types";

import { hideIntro, toggleListStyle, toggleTheme } from "../store/global/index";
import { makeGroupKey, fetchEntries } from "../store/entries/index";
import { fetchCommunity } from "../store/community/index";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NotFound from "../components/404";
import Intro from "../components/intro/index";
import DropDown from "../components/dropdown/index";
import ListStyleToggle from "../components/list-style-toggle/index";
import LinearProgress from "../components/linear-progress/index";
import EntryListLoadingItem from "../components/entry-list-loading-item/index";
import DetectBottom from "../components/detect-bottom/index";
import EntryListContent from "../components/entry-list/index";

import ProfileCard from "../components/profile-card";
import ProfileMenu from "../components/profile-menu";
import ProfileCover from "../components/profile-cover";

import { _t } from "../i18n";

import _c from "../util/fix-class-names";

interface MatchParams {
  username: string;
  section?: string;
}

interface Props {
  history: History;
  location: Location;
  match: match<MatchParams>;
  global: GlobalState;
  entries: EntriesState;
  accounts: AccountsState;
  toggleTheme: () => void;
  toggleListStyle: () => void;
  fetchEntries: (what: string, tag: string, more: boolean) => void;
  addAccount: (data: Account) => void;
}

class ProfilePage extends Component<Props> {
  componentDidMount() {
    const { match } = this.props;
    if (match.params.section === "wallet") {
      return;
    }

    const { global, fetchEntries } = this.props;
    fetchEntries(global.filter, global.tag, false);
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { match } = this.props;
    if (match.params.section === "wallet") {
      return;
    }

    const { global, fetchEntries } = this.props;
    const { global: pGlobal } = prevProps;

    if (!(global.filter === pGlobal.filter)) {
      fetchEntries(global.filter, global.tag, false);
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
    const { global, entries, accounts, match } = this.props;

    const username = match.params.username.replace("@", "");
    const { section = "blog" } = match.params;
    const account = accounts.find((x) => x.name === username);

    if (!account) {
      return <NotFound />;
    }

    const { filter, tag } = global;

    const groupKey = makeGroupKey(filter, tag);

    const data = entries[groupKey];

    if (data === undefined) {
      return null;
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

        <div className="app-content profile-page">
          <div className="profile-side">
            <ProfileCard {...this.props} account={account} />
          </div>
          <div className="content-side">
            <ProfileMenu {...this.props} username={username} section={section} />
            <ProfileCover {...this.props} account={account} />

            <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
              <div className={_c(`entry-list-body ${global.listStyle === ListStyle.grid ? "grid-view" : ""}`)}>
                {loading && entryList.length === 0 && <EntryListLoadingItem />}
                <EntryListContent {...this.props} entries={entryList} />
              </div>
            </div>
            {loading && entryList.length > 0 ? <LinearProgress /> : ""}
            <DetectBottom onBottom={this.bottomReached} />
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global,
  entries: state.entries,
  accounts: state.accounts,
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
