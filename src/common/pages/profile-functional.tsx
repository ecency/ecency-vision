import React, { Fragment, useEffect, useState, useCallback } from "react";
import { match } from "react-router";

import { Redirect } from "react-router-dom";
import { History } from "history";
import _ from "lodash";
import { _t } from "../i18n";
import { ListStyle } from "../store/global/types";

import { makeGroupKey } from "../store/entries";
import { ProfileFilter } from "../store/global/types";
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
import WalletHiveEngineDetail from "../components/wallet-hive-engine-detail";
import ScrollToTop from "../components/scroll-to-top";
import SearchListItem from "../components/search-list-item";
import SearchBox from "../components/search-box";
import * as bridgeApi from "../api/bridge";
import { search as searchApi } from "../api/search-api";
import ViewKeys from "../components/view-keys";
import { PasswordUpdate } from "../components/password-update";

import { getAccountFull } from "../api/hive";

import defaults from "../constants/defaults.json";
import _c from "../util/fix-class-names";
import { PageProps, pageMapDispatchToProps, pageMapStateToProps } from "./common";

import { connect } from "react-redux";
import { Account, FullAccount } from "../store/accounts/types";
import { withPersistentScroll } from "../components/with-persistent-scroll";
import useAsyncEffect from "use-async-effect";
import { usePrevious } from "../util/use-previous";
import WalletSpk from "../components/wallet-spk";
import { getTokenBalances } from "../api/hive-engine";

interface MatchParams {
  username: string;
  section?: string;
  search?: string;
  token?: string;
}

interface Props extends PageProps {
  match: match<MatchParams>;
  history: History;
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
  const [tokenList, setTokenList] = useState<Array<string>>([]);

  useAsyncEffect(async (_) => {
    const { accounts, match, global, fetchEntries, fetchPoints } = props;

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
    fetchPoints(username);

    const accountUsername = username.replace("@", "");
    const account = accounts.find((x) => x.name === accountUsername);

    if (account) {
      // no account.  return early.
      setAccount(account);
      setSection(section || ProfileFilter.blog);
      setUsername(username.replace("@", ""));

      await initPinnedEntry(username.replace("@", ""), account);
    }

    const rawData = await getTokenBalances(username.replace("@", ""));
    const newTokenNames = (() => {
      try {
        return rawData.map((d) => d.symbol);
      } catch (e) {
        return [];
      }
    })();

    setTokenList(newTokenNames);

    return () => {
      const { resetTransactions, resetPoints } = props;
      resetTransactions();
      resetPoints();
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
      if (prevMatchUsername !== username) {
        const rawData = await getTokenBalances(username.replace("@", ""));
        const newTokenNames = (() => {
          try {
            return rawData.map((d) => d.symbol);
          } catch (e) {
            return [];
          }
        })();

        setTokenList(newTokenNames);
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

        props.resetPoints();
        props.fetchPoints(`@${nextUsername}`);
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

  const bottomReached = () => {
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
    const {
      match,
      global,
      invalidateEntries,
      fetchEntries,
      resetTransactions,
      fetchTransactions,
      resetPoints,
      fetchPoints
    } = props;
    const { username, section } = match.params;

    setLoading(true);
    try {
      await ensureAccount();
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
    return props.global.isElectron
      ? NavBarElectron({
          ...props,
          reloadFn: reload,
          reloading: loading
        })
      : NavBar({ ...props });
  };

  const getMetaProps = () => {
    const username = props.match.params.username.replace("@", "");
    const account = props.accounts.find((x) => x.name === username);
    const { section = ProfileFilter.blog } = props.match.params;
    const url = `${defaults.base}/@${username}${section ? `/${section}` : ""}`;

    if (!account) {
      return {};
    }

    return account.__loaded
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

          {[...Object.keys(ProfileFilter), "communities"].includes(section) &&
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
                  return WalletHiveEngine({
                    ...props,
                    account,
                    updateWalletValues: ensureAccount,
                    transferAsset: null
                  });
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
                      <div className="container-fluid">
                        <div className="row">
                          <div className="col-12 col-md-6">
                            <h6 className="border-bottom pb-3">{_t("view-keys.header")}</h6>
                            <ViewKeys activeUser={props.activeUser} />
                          </div>
                          <div className="col-12 col-md-6">
                            <h6 className="border-bottom pb-3">{_t("password-update.title")}</h6>
                            <PasswordUpdate activeUser={props.activeUser} />
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return <Redirect to={`/@${account.name}`} />;
                  }
                }

                const sectionUppercase = section.toUpperCase();
                if (section !== "blog" && tokenList.find((x) => sectionUppercase === x)) {
                  return WalletHiveEngine({
                    ...props,
                    account,
                    updateWalletValues: ensureAccount,
                    transferAsset: section.toUpperCase()
                  });
                }
                if (data !== undefined) {
                  let entryList = data?.entries;
                  const { profile } = account as FullAccount;
                  entryList = entryList.filter((item) => item.permlink !== profile?.pinned);
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
