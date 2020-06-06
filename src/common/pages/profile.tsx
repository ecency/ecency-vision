import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import { match } from "react-router";

import { AppState } from "../store";
import { ListStyle, State as GlobalState } from "../store/global/types";
import { State as EntriesState } from "../store/entries/types";
import { Account, State as AccountsState } from "../store/accounts/types";
import { DynamicProps } from "../store/dynamic-props/types";

import { toggleListStyle, toggleTheme } from "../store/global";
import { makeGroupKey, fetchEntries } from "../store/entries";
import { addAccount } from "../store/accounts";
import { fetchDynamicProps } from "../store/dynamic-props";

import Meta from "../components/meta";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import NotFound from "../components/404";
import LinearProgress from "../components/linear-progress/index";
import EntryListLoadingItem from "../components/entry-list-loading-item";
import DetectBottom from "../components/detect-bottom";
import EntryListContent from "../components/entry-list";

import ProfileCard from "../components/profile-card";
import ProfileMenu from "../components/profile-menu";
import ProfileCover from "../components/profile-cover";
import Wallet from "../components/wallet";

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
  dynamicProps: DynamicProps;
  entries: EntriesState;
  accounts: AccountsState;
  toggleTheme: () => void;
  toggleListStyle: () => void;
  fetchEntries: (what: string, tag: string, more: boolean) => void;
  addAccount: (data: Account) => void;
  fetchDynamicProps: () => void;
}

class ProfilePage extends Component<Props> {
  componentDidMount() {
    const { global, fetchEntries, fetchDynamicProps } = this.props;

    // fetch posts
    fetchEntries(global.filter, global.tag, false);

    // fetch global props for wallet
    fetchDynamicProps();
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { match } = this.props;
    if (match.params.section === "wallet") {
      return;
    }

    const { global, fetchEntries } = this.props;
    const { global: pGlobal } = prevProps;

    if (!(global.filter === pGlobal.filter && global.tag === pGlobal.tag)) {
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
            {(() => {
              if (section === "wallet") {
                return <Wallet {...this.props} account={account} />;
              }

              const { filter, tag } = global;
              const groupKey = makeGroupKey(filter, tag);
              const data = entries[groupKey];

              if (data !== undefined) {
                const entryList = data?.entries;
                const loading = data?.loading;

                return (
                  <>
                    <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
                      <div className={_c(`entry-list-body ${global.listStyle === ListStyle.grid ? "grid-view" : ""}`)}>
                        {loading && entryList.length === 0 && <EntryListLoadingItem />}
                        <EntryListContent {...this.props} entries={entryList} />
                      </div>
                    </div>
                    {loading && entryList.length > 0 ? <LinearProgress /> : ""}
                    <DetectBottom onBottom={this.bottomReached} />
                  </>
                );
              }

              return null;
            })()}
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
  dynamicProps: state.dynamicProps,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      toggleTheme,
      toggleListStyle,
      fetchEntries,
      addAccount,
      fetchDynamicProps,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
