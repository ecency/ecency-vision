import React, { Fragment } from "react";
import { match } from "react-router";

import { Redirect } from "react-router-dom";
import { History } from "history";
import _ from "lodash";
import { _t } from "../i18n";
import { ListStyle } from "../store/global/types";

import { makeGroupKey } from "../store/entries";
import { ProfileFilter } from "../store/global/types";
import { Entry } from "../store/entries/types";
import BaseComponent from "../components/base";
import Meta from "../components/meta";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import NotFound from "../components/404";
import LinearProgress from "../components/linear-progress/index";
import EntryListLoadingItem from "../components/entry-list-loading-item";
import DetectBottom from "../components/detect-bottom";
import EntryListContent from "../components/entry-list";
import ProfileCard from "../components/profile-card";
import ProfileMenu from "../components/profile-menu";
import ProfileCover from "../components/profile-cover";
import ProfileCommunities from "../components/profile-communities";
import ProfileSettings from "../components/profile-settings";
import ProfileReferrals from "../components/profile-referrals";
import WalletHive from "../components/wallet-hive";
import WalletHiveEngine from "../components/wallet-hive-engine";
import WalletEcency from "../components/wallet-ecency";
import ScrollToTop from "../components/scroll-to-top";
import SearchListItem from "../components/search-list-item";
import { SearchType } from "../helper/search-query";
import SearchBox from "../components/search-box";
import * as bridgeApi from "../api/bridge";
import { search as searchApi, SearchResult } from "../api/search-api";
import ViewKeys from "../components/view-keys";
import { PasswordUpdate } from "../components/password-update";

import { getAccountFull } from "../api/hive";

import defaults from "../constants/defaults.json";
import _c from "../util/fix-class-names";
import { PageProps, pageMapDispatchToProps, pageMapStateToProps } from "./common";

import { FormControl } from "react-bootstrap";
import { connect } from "react-redux";
import { FullAccount } from "../store/accounts/types";
import tag from "../components/tag";
import { withPersistentScroll } from "../components/with-persistent-scroll";

interface MatchParams {
  username: string;
  section?: string;
  search?: string;
}

interface Props extends PageProps {
  match: match<MatchParams>;
  history: History;
}

interface State {
  loading: boolean;
  typing: boolean;
  isDefaultPost: boolean;
  search: string;
  author: string;
  type: SearchType;
  searchData: SearchResult[];
  searchDataLoading: boolean;
  pinnedEntry: Entry | null;
}

class ProfilePage extends BaseComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const { location } = props;
    let searchParam = location.search.replace("?", "");
    searchParam = searchParam.replace("q", "");
    searchParam = searchParam.replace("=", "");

    this.state = {
      loading: false,
      typing: false,
      isDefaultPost: false,
      searchDataLoading: searchParam.length > 0,
      search: searchParam,
      author: "",
      type: SearchType.ALL,
      pinnedEntry: null,
      searchData: []
    };
  }

  async componentDidMount() {
    const { accounts, match, global, fetchEntries, fetchTransactions, fetchPoints, location } =
      this.props;

    let searchParam = location.search.replace("?", "");
    searchParam = searchParam.replace("q", "");
    searchParam = searchParam.replace("=", "");
    if (searchParam.length) {
      this.handleInputChange(searchParam);
    }

    await this.ensureAccount();

    const { username, section } = match.params;
    if (!section || (section && Object.keys(ProfileFilter).includes(section))) {
      // fetch posts
      fetchEntries(global.filter, global.tag, false);
    }

    // fetch points
    fetchPoints(username);

    const accountUsername = username.replace("@", "");
    const account = accounts.find((x) => x.name === accountUsername) as FullAccount;

    if (
      account &&
      account.profile &&
      account.profile?.pinned &&
      ["blog", "posts"].includes(global.filter)
    ) {
      bridgeApi
        .getPost(accountUsername, account.profile?.pinned)
        .then((entry) => {
          this.setState({ pinnedEntry: entry });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const {
      accounts,
      match,
      global,
      fetchEntries,
      fetchTransactions,
      resetTransactions,
      fetchPoints,
      resetPoints,
      history,
      location: { search }
    } = this.props;
    const {
      accounts: prevAccounts,
      match: prevMatch,
      entries,
      location: { search: prevSearch },
      global: prevGlobal
    } = prevProps;

    const { username, section } = match.params;
    const { isDefaultPost } = this.state;

    if (prevSearch !== search) {
      let searchText = search.replace("?q=", "");
      this.setState({ search: searchText || "", searchDataLoading: searchText.length > 0 });
      searchText.length > 0 && this.handleInputChange(searchText);
    }

    // username changed. re-fetch wallet transactions and points
    if (username !== prevMatch.params.username) {
      this.ensureAccount().then(() => {
        resetTransactions();
        fetchTransactions(username);

        resetPoints();
        fetchPoints(username);
      });
    }

    // Wallet and points are not a correct filter to fetch posts
    if (section && !Object.keys(ProfileFilter).includes(section)) {
      if (section !== prevMatch.params.section) {
        this.setState({ search: "" });
      }
      return;
    }

    // filter or username changed. fetch posts.
    if (section !== prevMatch.params.section || username !== prevMatch.params.username) {
      fetchEntries(global.filter, global.tag, false);
    }

    if (entries) {
      const { filter, tag } = global;
      const groupKey = makeGroupKey(filter, tag);
      const prevData = entries[groupKey];
      if (prevData) {
        const data = this.props.entries[groupKey];
        const { loading } = data;
        const { loading: prevLoading } = prevData;

        if (
          loading !== prevLoading &&
          !loading &&
          data.entries.length === 0 &&
          groupKey === `blog-${username}` &&
          !isDefaultPost
        ) {
          this.setState({ isDefaultPost: true });
          history.push(`/${username}/posts`);
        }
      }
    }

    if (prevProps.global.filter !== this.props.global.filter) {
      this.setState({ search: "" });
    }

    if (["comments", "replies"].includes(global.filter) && global.filter !== prevGlobal.filter) {
      this.setState({ pinnedEntry: null });
    }

    let accountUsername = username.replace("@", "");
    const account = accounts.find((x) => x.name === accountUsername) as FullAccount;
    const prevAccount = prevAccounts.find((x) => x.name === accountUsername) as FullAccount;

    if (["blog", "posts"].includes(global.filter)) {
      if (
        (account &&
          prevAccount &&
          account.profile &&
          prevAccount.profile &&
          account.profile.pinned !== prevAccount.profile.pinned) ||
        (account &&
          account.profile &&
          account.profile.pinned &&
          global.filter !== prevGlobal.filter) ||
        (account !== prevAccount && account.profile && account.profile.pinned)
      ) {
        this.setState({ pinnedEntry: null });

        bridgeApi
          .getPost(accountUsername, account.profile.pinned)
          .then((entry) => {
            this.setState({ pinnedEntry: entry });
          })
          .catch((e) => {
            console.log(e);
          });
      }
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    const { resetTransactions, resetPoints } = this.props;

    // reset transactions and points on unload
    resetTransactions();
    resetPoints();
  }

  ensureAccount = () => {
    const { match, accounts, addAccount } = this.props;

    const username = match.params.username.replace("@", "");
    const account = accounts.find((x) => x.name === username);

    if (!account) {
      // The account isn't in reducer. Fetch it and add to reducer.
      this.stateSet({ loading: true });

      return getAccountFull(username)
        .then((data) => {
          if (data.name === username) {
            addAccount(data);
          }
        })
        .finally(() => {
          this.stateSet({ loading: false });
        });
    } else {
      // The account is in reducer. Update it.
      return getAccountFull(username).then((data) => {
        if (data.name === username) {
          addAccount(data);
        }
      });
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

  reload = () => {
    const {
      match,
      global,
      invalidateEntries,
      fetchEntries,
      resetTransactions,
      fetchTransactions,
      resetPoints,
      fetchPoints
    } = this.props;
    const { username, section } = match.params;

    this.stateSet({ loading: true });
    this.ensureAccount()
      .then(() => {
        // reload transactions
        resetTransactions();
        fetchTransactions(username);

        // reload points
        resetPoints();
        fetchPoints(username);

        if (!section || (section && Object.keys(ProfileFilter).includes(section))) {
          // reload posts
          invalidateEntries(makeGroupKey(global.filter, global.tag));
          fetchEntries(global.filter, global.tag, false);
        }
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  handleChangeSearch = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const { value } = event.target;
    this.setState({ search: value, typing: value.length === 0 ? false : true });
    this.delayedSearch(value);
  };

  handleInputChange = async (value: string): Promise<void> => {
    this.setState({ typing: false });
    if (value.trim() === "") {
      // this.setState({proposals: this.state.allProposals});
    } else {
      const { global } = this.props;
      this.setState({ searchDataLoading: true });

      let query = `${value} author:${global.tag.substring(1)}`;

      if (global.filter === "posts") {
        query += ` type:post`;
      } else if (global.filter === "comments") {
        query += ` type:comment`;
      }
      let data: any;
      try {
        data = await searchApi(query, "newest", "0");
      } catch (error) {
        data = null;
      }
      if (data && data.results) {
        let sortedResults = data.results.sort(
          (a: any, b: any) => Date.parse(b.created_at) - Date.parse(a.created_at)
        );

        this.setState({ searchData: sortedResults, loading: false, searchDataLoading: false });
      }
    }
  };

  delayedSearch = _.debounce(this.handleInputChange, 2000);

  authorChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    this.setState({ author: e.target.value.trim() });
  };

  typeChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    this.setState({ type: e.target.value as SearchType });
  };

  render() {
    const { global, entries, accounts, match, activeUser } = this.props;
    const { loading, search, searchDataLoading, searchData, typing } = this.state;
    const navBar = global.isElectron
      ? NavBarElectron({
          ...this.props,
          reloadFn: this.reload,
          reloading: loading
        })
      : NavBar({ ...this.props });

    if (loading) {
      return (
        <>
          {navBar}
          <div className="pt-3">
            <div className="mt-5">
              <LinearProgress />
            </div>
          </div>
        </>
      );
    }

    const username = match.params.username.replace("@", "");
    const { section = ProfileFilter.blog } = match.params;
    const account = accounts.find((x) => x.name === username);

    if (!account) {
      return NotFound({ ...this.props });
    }

    //  Meta config
    const url = `${defaults.base}/@${username}${section ? `/${section}` : ""}`;
    const metaProps = account.__loaded
      ? {
          title: `${account.profile?.name || account.name}'s ${
            section ? (section === "engine" ? "tokens" : `${section}`) : ""
          } on decentralized web`,
          description:
            `${
              account.profile?.about
                ? `${account.profile?.about} ${section ? `${section}` : ""}`
                : `${account.profile?.name || account.name} ${section ? `${section}` : ""}`
            }` || "",
          url: `/@${username}${section ? `/${section}` : ""}`,
          canonical: url,
          image: `${defaults.imageServer}/u/${username}/avatar/medium`,
          rss: `${defaults.base}/@${username}/rss`,
          keywords: `${username}, ${username}'s blog`
        }
      : {};

    const { filter, tag } = global;
    const groupKey = makeGroupKey(filter, tag);
    const data = entries[groupKey];
    let containerClasses = global.isElectron
      ? "app-content profile-page mt-0 pt-6"
      : "app-content profile-page";

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <Feedback activeUser={this.props.activeUser} />
        {navBar}

        <div className={containerClasses}>
          <div className="profile-side">
            {ProfileCard({
              ...this.props,
              account,
              section
            })}
          </div>
          <span itemScope={true} itemType="http://schema.org/Person">
            {account.__loaded && (
              <meta itemProp="name" content={account.profile?.name || account.name} />
            )}
          </span>
          <div className="content-side">
            {ProfileMenu({
              ...this.props,
              username,
              section
            })}

            {[...Object.keys(ProfileFilter), "communities"].includes(section) &&
              ProfileCover({
                ...this.props,
                account
              })}

            {data &&
              data.entries.length > 0 &&
              (filter === "posts" || filter === "comments") &&
              section === filter && (
                <div className="searchProfile">
                  <SearchBox
                    placeholder={_t("search-comment.search-placeholder")}
                    value={search}
                    onChange={this.handleChangeSearch}
                    autoComplete="off"
                    showcopybutton={true}
                    username={`@${username}`}
                    filter={filter}
                  />
                </div>
              )}

            {typing ? (
              <div className="mt-3">
                <LinearProgress />
              </div>
            ) : search.length > 0 ? (
              <>
                {searchDataLoading ? (
                  <div className="mt-3">
                    <LinearProgress />
                  </div>
                ) : searchData.length > 0 ? (
                  <div className="search-list">
                    {searchData.map((res) => (
                      <Fragment key={`${res.author}-${res.permlink}-${res.id}`}>
                        {SearchListItem({ ...this.props, res: res })}
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  _t("g.no-matches")
                )}
              </>
            ) : (
              <>
                {(() => {
                  if (section === "wallet") {
                    return WalletHive({
                      ...this.props,
                      account,
                      updateWalletValues: this.ensureAccount
                    });
                  }

                  if (section === "engine") {
                    return WalletHiveEngine({
                      ...this.props,
                      account,
                      updateWalletValues: this.ensureAccount
                    });
                  }

                  if (section === "points") {
                    return WalletEcency({
                      ...this.props,
                      account,
                      updateWalletValues: this.ensureAccount
                    });
                  }

                  if (section === "communities") {
                    return ProfileCommunities({
                      ...this.props,
                      account
                    });
                  }

                  if (section === "settings") {
                    return ProfileSettings({
                      ...this.props,
                      account
                    });
                  }

                  if (section === "referrals") {
                    return ProfileReferrals({
                      ...this.props,
                      account,
                      updateWalletValues: this.ensureAccount
                    });
                  }

                  if (section === "permissions" && activeUser) {
                    if (account.name === activeUser.username) {
                      return (
                        <div className="container-fluid">
                          <div className="row">
                            <div className="col-12 col-md-6">
                              <h6 className="border-bottom pb-3">{_t("view-keys.header")}</h6>
                              <ViewKeys activeUser={activeUser} />
                            </div>
                            <div className="col-12 col-md-6">
                              <h6 className="border-bottom pb-3">{_t("password-update.title")}</h6>
                              <PasswordUpdate activeUser={activeUser} />
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return <Redirect to={`/@${account.name}`} />;
                    }
                  }

                  if (data !== undefined) {
                    let entryList = data?.entries;
                    const { profile } = account as FullAccount;
                    entryList = entryList.filter((item) => item.permlink !== profile?.pinned);
                    if (this.state.pinnedEntry) {
                      entryList.unshift(this.state.pinnedEntry);
                    }
                    const loading = data?.loading;
                    return (
                      <>
                        <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
                          <div
                            className={_c(
                              `entry-list-body ${
                                global.listStyle === ListStyle.grid ? "grid-view" : ""
                              }`
                            )}
                          >
                            {loading && entryList.length === 0 && <EntryListLoadingItem />}
                            {EntryListContent({
                              ...this.props,
                              entries: entryList,
                              promotedEntries: [],
                              loading,
                              account
                            })}
                          </div>
                        </div>
                        {loading && entryList.length > 0 ? <LinearProgress /> : ""}
                        <DetectBottom onBottom={this.bottomReached} />
                      </>
                    );
                  }

                  return null;
                })()}
              </>
            )}
          </div>
        </div>
      </>
    );
  }
}

export default connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(withPersistentScroll(ProfilePage));
