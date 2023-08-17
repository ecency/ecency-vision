import React, { Fragment, useCallback, useEffect, useState } from "react";
import { match } from "react-router";

import { Redirect } from "react-router-dom";
import _ from "lodash";
import { _t } from "../i18n";
import { ListStyle, ProfileFilter } from "../store/global/types";

import { makeGroupKey } from "../store/entries";
import { Entry, EntryGroup } from "../store/entries/types";
import Meta from "../components/meta";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
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
import SearchBox from "../components/search-box";
import * as bridgeApi from "../api/bridge";
import { search as searchApi } from "../api/search-api";
import { PasswordUpdate } from "../components/password-update";
import ManageAuthorities from "../components/manage-authority";
import AccountRecovery from "../components/recovery-account";

import CurationTrail from "../components/curation-trail";

import { getAccountFull } from "../api/hive";

import defaults from "../constants/defaults.json";
import _c from "../util/fix-class-names";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";

import { connect } from "react-redux";
import { Account, FullAccount } from "../store/accounts/types";
import { withPersistentScroll } from "../components/with-persistent-scroll";
import useAsyncEffect from "use-async-effect";
import { usePrevious } from "../util/use-previous";
import WalletSpk from "../components/wallet-spk";
import "./profile.scss";
import { useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../core";
import { ProfileActivites } from "../components/profile-activities";

interface MatchParams {
  username: string;
  section?: string;
  search?: string;
}

interface Props extends PageProps {
  match: match<MatchParams>;
}

export const Profile = (props: Props) => {
  const { location } = props;
  let searchParam = location.search.replace("?", "");
  searchParam = searchParam.replace("q", "");
  searchParam = searchParam.replace("=", "");

  const prevMatchUsername = usePrevious(props.match.params.username);
  const prevMatchSection = usePrevious(props.match.params.section);
  const prevEntries = usePrevious(props.entries);
  const prevSearch = usePrevious(props.location.search);
  const prevGlobal = usePrevious(props.global);

  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [isDefaultPost, setIsDefaultPost] = useState(false);
  const [tabState, setTabState] = useState(1);
  const [searchDataLoading, setSearchDataLoading] = useState(searchParam.length > 0);
  const [search, setSearch] = useState(searchParam);
  const [pinnedEntry, setPinnedEntry] = useState<Entry | null>(null);
  const [searchData, setSearchData] = useState<any[]>([]);
  const [account, setAccount] = useState<Account>({ __loaded: false } as Account);
  const [username, setUsername] = useState("");
  const [section, setSection] = useState("");
  const [data, setData] = useState<EntryGroup>({
    entries: [],
    sid: "",
    loading: false,
    error: null,
    hasMore: false
  });

  const queryClient = useQueryClient();

  useAsyncEffect(async (_) => {
    const { accounts, match, global, fetchEntries } = props;

    if (search.length) {
      await handleInputChange(searchParam);
    }

    await ensureAccount();

    const { username, section } = match.params;

    if (!section || (section && Object.keys(ProfileFilter).includes(section))) {
      // fetch posts
      fetchEntries(global.filter, global.tag, false);
    }
    // fetch points
    queryClient.invalidateQueries([QueryIdentifiers.POINTS, username]);

    const accountUsername = username.replace("@", "");
    const account = accounts.find((x) => x.name === accountUsername) as FullAccount;

    setAccount(account);
    setSection(section || ProfileFilter.blog);
    setUsername(username.replace("@", ""));

    await initPinnedEntry(username.replace("@", ""), account);

    return () => {
      const { resetTransactions } = props;
      resetTransactions();
    };
  }, []);
  useEffect(() => {
    setData(props.entries[makeGroupKey(props.global.filter, props.global.tag)]);
    setLoading(false);
  }, [props.global.filter, props.global.tag, props.entries]);
  useAsyncEffect(
    async (_) => {
      if (prevSearch !== search) {
        let searchText = search.replace("?q=", "");
        setSearchDataLoading(searchText.length > 0);
        searchText.length > 0 && (await handleInputChange(searchText));
      }
    },
    [props.location]
  );
  useAsyncEffect(
    async (_) => {
      const { global, fetchEntries, history } = props;

      const nextUsername = props.match.params.username.replace("@", "");
      const nextSection = props.match.params.section;
      const nextAccount = props.accounts.find((x) => x.name === nextUsername);

      setUsername(nextUsername);
      setSection(nextSection || ProfileFilter.blog);
      setAccount(
        (nextAccount as FullAccount) || ({ __loaded: false, name: nextUsername } as Account)
      );

      const entries = prevEntries;

      // username changed. re-fetch wallet transactions and points
      if (`@${nextUsername}` !== prevMatchUsername) {
        setPinnedEntry(null);
        await ensureAccount();
        props.resetTransactions();
        props.fetchTransactions(`@${nextUsername}`);

        queryClient.invalidateQueries([QueryIdentifiers.POINTS, nextUsername]);
      }

      // Wallet and points are not a correct filter to fetch posts
      if (nextSection && !Object.keys(ProfileFilter).includes(nextSection)) {
        if (nextSection !== prevMatchSection) {
          setSearch("");
        }
        return;
      }

      // filter or username changed. fetch posts.
      if (nextSection !== prevMatchSection || `@${nextUsername}` !== prevMatchUsername) {
        fetchEntries(global.filter, global.tag, false);
      }

      if (entries) {
        const { filter, tag } = global;
        const groupKey = makeGroupKey(filter, tag);
        const prevData = entries[groupKey];
        if (prevData) {
          const data = props.entries[groupKey];
          const { loading } = data;
          const { loading: prevLoading } = prevData;

          if (
            loading !== prevLoading &&
            !loading &&
            data.entries.length === 0 &&
            groupKey === `blog-@${nextUsername}` &&
            !isDefaultPost
          ) {
            setIsDefaultPost(true);
            history.push(`/@${nextUsername}/posts`);
          }
        }
      }

      if (prevGlobal?.filter && prevGlobal?.filter !== props.global.filter) {
        setSearch("");
      }

      if (
        ["comments", "replies"].includes(props.global.filter) &&
        props.global.filter !== prevGlobal?.filter
      ) {
        setPinnedEntry(null);
      }

      if (
        `@${nextUsername}` !== prevMatchUsername ||
        (["blog", "posts"].includes(props.global.filter) && !pinnedEntry)
      ) {
        await initPinnedEntry(nextUsername, nextAccount);
      }
    },
    [props.accounts, props.match, props.global, props.history, props.location, props.activeUser]
  );

  const ensureAccount = async () => {
    const { match, accounts, addAccount } = props;

    const username = match.params.username.replace("@", "");
    const account = accounts.find((x) => x.name === username);

    if (!account) {
      // The account isn't in reducer. Fetch it and add to reducer.

      try {
        const data = await getAccountFull(username);
        if (data.name === username) {
          addAccount(data);
        } else {
          props.history.push("/404");
        }
      } finally {
      }
    } else {
      try {
        const data = await getAccountFull(username);
        if (data.name === username) {
          addAccount(data);
        } else {
          props.history.push("/404");
        }
      } finally {
      }
    }
  };

  const bottomReached = async () => {
    const { global, entries, fetchEntries } = props;
    const { filter, tag } = global;
    const groupKey = makeGroupKey(filter, tag);

    const data = entries[groupKey];
    const { loading, hasMore } = data;

    if (!loading && hasMore) {
      fetchEntries(filter, tag, true);
    }
  };

  const reload = async () => {
    const { match, global, invalidateEntries, fetchEntries, resetTransactions, fetchTransactions } =
      props;
    const { username, section } = match.params;

    setLoading(true);
    try {
      await ensureAccount();
      // reload transactions
      resetTransactions();
      fetchTransactions(username);

      // reload points
      queryClient.invalidateQueries([QueryIdentifiers.POINTS, username]);

      if (!section || (section && Object.keys(ProfileFilter).includes(section))) {
        // reload posts
        invalidateEntries(makeGroupKey(global.filter, global.tag));
        fetchEntries(global.filter, global.tag, false);
      }
    } finally {
    }
  };

  const handleChangeSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearch(value);
    setTyping(value.length !== 0);
    delayedSearch(value);
  };

  const handleInputChange = async (value: string) => {
    // setSearch(value || '');
    setTyping(false);
    if (value.trim() === "") {
      // this.setState({proposals: this.state.allProposals});
    } else {
      const { global } = props;
      setSearchDataLoading(true);

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
        const sortedResults = data.results.sort(
          (a: any, b: any) => Date.parse(b.created_at) - Date.parse(a.created_at)
        );
        setSearchData(sortedResults);
        setLoading(false);
        setSearchDataLoading(false);
      }
    }
  };

  const delayedSearch = useCallback(_.debounce(handleInputChange, 3000, { leading: true }), []);

  const getNavBar = () => {
    return props.global.isElectron ? (
      NavBarElectron({
        ...props,
        reloadFn: reload,
        reloading: loading
      })
    ) : (
      <NavBar history={props.history} />
    );
  };
  const getMetaProps = () => {
    const username = props.match.params.username.replace("@", "");
    const account = props.accounts.find((x) => x.name === username);
    const { section = ProfileFilter.blog } = props.match.params;
    const url = `${defaults.base}/@${username}${section ? `/${section}` : ""}`;
    const ncount = props.notifications.unread > 0 ? `(${props.notifications.unread}) ` : "";

    if (!account) {
      return {};
    }

    return account?.__loaded
      ? {
          title: `${ncount}${account.profile?.name || account.name}'s ${
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
  };

  const initPinnedEntry = async (username: string, account: Account | undefined) => {
    if (
      !["blog", "posts"].includes(props.global.filter) ||
      !((account as FullAccount)?.profile && (account as FullAccount)?.profile?.pinned) ||
      !((account as FullAccount)?.profile && (account as FullAccount)?.profile?.pinned !== "none")
    ) {
      return;
    }

    setPinnedEntry(null);

    try {
      const entry = await bridgeApi.getPost(username, (account as FullAccount).profile?.pinned);
      if (entry) {
        setPinnedEntry(entry);
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Pin entry directly from menu
  const pinEntry = (entry: Entry | null) => {
    const updatedAccount = {
      ...account,
      profile: {
        ...(account as FullAccount).profile,
        pinned: entry?.permlink || ""
      }
    };
    setAccount(updatedAccount);
    props.addAccount(updatedAccount);
    props.updateActiveUser(updatedAccount);

    setPinnedEntry(null);
    setPinnedEntry(entry);
  };
  return (
    <>
      <Meta {...getMetaProps()} />
      <ScrollToTop />
      <Theme global={props.global} />
      <Feedback activeUser={props.activeUser} />
      {getNavBar()}

      <div
        className={
          props.global.isElectron
            ? "app-content profile-page mt-0 pt-6"
            : "app-content profile-page"
        }
      >
        <div className="profile-side">{ProfileCard({ ...props, account, section })}</div>
        <span itemScope={true} itemType="http://schema.org/Person">
          {account?.__loaded && (
            <meta itemProp="name" content={account.profile?.name || account.name} />
          )}
        </span>
        <div className="content-side">
          {ProfileMenu({ ...props, username, section })}

          {[...Object.keys(ProfileFilter), "communities"].includes(section) && section !== "activities" &&
            ProfileCover({ ...props, account })}

          {data &&
            data.entries.length > 0 &&
            (props.global.filter === "posts" || props.global.filter === "comments") &&
            section === props.global.filter && (
              <div className="searchProfile">
                <SearchBox
                  placeholder={_t("search-comment.search-placeholder")}
                  value={search}
                  onChange={handleChangeSearch}
                  autoComplete="off"
                  showcopybutton={true}
                  username={`@${username}`}
                  filter={props.global.filter}
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
                      {SearchListItem({ ...props, res: res })}
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
                  return WalletHive({ ...props, account, updateWalletValues: ensureAccount });
                }
                if (section === "engine") {
                  return WalletHiveEngine({ ...props, account, updateWalletValues: ensureAccount });
                }
                if (section === "spk") {
                  return WalletSpk({
                    ...props,
                    account,
                    isActiveUserWallet: account.name === props.activeUser?.username
                  });
                }
                if (section === "points") {
                  return WalletEcency({ ...props, account, updateWalletValues: ensureAccount });
                }
                if (section === "communities") {
                  return ProfileCommunities({ ...props, account });
                }
                if (section === "settings") {
                  return ProfileSettings({ ...props, account });
                }
                if (section === "referrals") {
                  return ProfileReferrals({ ...props, account, updateWalletValues: ensureAccount });
                }

                if (section === "permissions" && props.activeUser) {
                  if (account.name === props.activeUser.username) {
                    return (
                      <>
                        <div className="permission-menu">
                          <div className="permission-menu-items">
                            <h6
                              className={
                                tabState === 1 ? "border-bottom pb-3 tab current-tab" : "tab"
                              }
                              onClick={() => setTabState(1)}
                            >
                              {_t("manage-authorities.title")}
                            </h6>
                          </div>
                          <div className="permission-menu-items">
                            <h6
                              className={
                                tabState === 2 ? "border-bottom pb-3 tab current-tab" : "tab"
                              }
                              onClick={() => setTabState(2)}
                            >
                              {_t("account-recovery.title")}
                            </h6>
                          </div>
                          <div className="permission-menu-items">
                            <h6
                              className={
                                tabState === 3 ? "border-bottom pb-3 tab current-tab" : "tab"
                              }
                              onClick={() => setTabState(3)}
                            >
                              {_t("password-update.title")}
                            </h6>
                          </div>
                        </div>
                        <div className="container-fluid">
                          {tabState === 1 && <ManageAuthorities {...props} />}
                          <div className="row pb-4">
                            <div className="col-lg-6 col-md-6 col-sm-6">
                              {tabState === 2 && <AccountRecovery {...props} />}
                              {tabState === 3 && <PasswordUpdate activeUser={props.activeUser} />}
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  } else {
                    return <Redirect to={`/@${account.name}`} />;
                  }
                }

                if (section === "trail") {
                  return (
                    <>
                      <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
                        <div
                          className={_c(
                            `entry-list-body ${
                              props.global.listStyle === ListStyle.grid ? "grid-view" : ""
                            }`
                          )}
                        >
                          <CurationTrail
                            {...{
                              ...props,
                              account,
                              pinEntry,
                              username,
                              section
                            }}
                          />
                        </div>
                      </div>
                    </>
                  );
                }
                if (section === "activities") {
                  return (
                    <>
                      <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
                        <div
                          className={_c(
                            `entry-list-body ${
                              props.global.listStyle === ListStyle.grid ? "grid-view" : ""
                            }`
                          )}
                        >
                          <ProfileActivites account={account}/>
                        </div>
                      </div>
                    </>
                  );
                }

                if (data !== undefined && section) {
                  let entryList;
                  entryList = data?.entries;
                  entryList = entryList.filter(
                    (item: Entry) => item.permlink !== (account as FullAccount)?.profile?.pinned
                  );
                  if (pinnedEntry) {
                    entryList.unshift(pinnedEntry);
                  }
                  const isLoading = loading || data?.loading;
                  return (
                    <>
                      <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
                        <div
                          className={_c(
                            `entry-list-body ${
                              props.global.listStyle === ListStyle.grid ? "grid-view" : ""
                            }`
                          )}
                        >
                          {loading && entryList.length === 0 && <EntryListLoadingItem />}
                          {EntryListContent({
                            ...props,
                            pinEntry,
                            entries: entryList,
                            promotedEntries: [],
                            loading: isLoading,
                            account
                          })}
                        </div>
                      </div>
                      {loading && entryList.length > 0 ? <LinearProgress /> : ""}
                      <DetectBottom onBottom={bottomReached} />
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
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(withPersistentScroll(Profile));
