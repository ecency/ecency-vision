import React, { Fragment, useCallback, useEffect, useState } from "react";
import "./profile.scss";
import { useQueryClient } from "@tanstack/react-query";
import {
  Feedback,
  LinearProgress,
  Navbar,
  ScrollToTop,
  SearchBox,
  SearchListItem,
  Theme
} from "@/features/shared";
import { ListStyle, ProfileFilter } from "@/enums";
import { Account, Entry, EntryGroup, FullAccount } from "@/entities";
import i18next from "i18next";
import defaults from "@/defaults.json";
import {
  CurationTrail,
  ManageAuthorities,
  PasswordUpdate,
  ProfileCard,
  ProfileCover,
  ProfileEntriesList,
  ProfileMenu,
  ProfileReferrals,
  ProfileSettings,
  WalletHive
} from "@/app/[filterOrCategory]/[entryOrCommunity]/_profile-components";
import { useGlobalStore } from "@/core/global-store";
import { getAccountFullQuery } from "@/api/queries";
import { notFound } from "next/navigation";
import { AccountRecovery } from "@/app/[filterOrCategory]/[entryOrCommunity]/_profile-components/recovery-account";

interface Props {
  params: { filterOrCategory: string; entryOrCommunity: string };
  searchParams: Record<string, string | undefined>;
}

export async function Profile({
  params: { filterOrCategory: username, entryOrCommunity: section },
  searchParams: { q: searchParam }
}: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const listStyle = useGlobalStore((s) => s.listStyle);

  const account = await getAccountFullQuery(username).prefetch();

  if (!account) {
    return notFound();
  }

  const prevMatchUsername = usePrevious(username);
  const prevMatchSection = usePrevious(section);
  const prevEntries = usePrevious(entries);
  const prevSearch = usePrevious(search);
  const prevGlobal = usePrevious(global);

  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [isDefaultPost, setIsDefaultPost] = useState(false);
  const [tabState, setTabState] = useState(1);
  const [searchDataLoading, setSearchDataLoading] = useState(searchParam.length > 0);
  const [search, setSearch] = useState(searchParam);
  const [pinnedEntry, setPinnedEntry] = useState<Entry | null>(null);
  const [searchData, setSearchData] = useState<any[]>([]);
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
    setData(entries[makeGroupKey(global.filter, global.tag)]);
    setLoading(false);
  }, [global.filter, global.tag, entries]);
  useAsyncEffect(
    async (_) => {
      if (prevSearch !== search) {
        let searchText = search.replace("?q=", "");
        setSearchDataLoading(searchText.length > 0);
        searchText.length > 0 && (await handleInputChange(searchText));
      }
    },
    [location]
  );
  useAsyncEffect(
    async (_) => {
      const { global, fetchEntries, history } = props;

      const nextUsername = match.params.username.replace("@", "");
      const nextSection = match.params.section;
      const nextAccount = accounts.find((x) => x.name === nextUsername);

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
        resetTransactions();
        fetchTransactions(`@${nextUsername}`);

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
          const data = entries[groupKey];
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

      if (prevGlobal?.filter && prevGlobal?.filter !== global.filter) {
        setSearch("");
      }

      if (["comments", "replies"].includes(global.filter) && filter !== prevGlobal?.filter) {
        setPinnedEntry(null);
      }

      if (
        `@${nextUsername}` !== prevMatchUsername ||
        (["blog", "posts"].includes(global.filter) && !pinnedEntry)
      ) {
        await initPinnedEntry(nextUsername, nextAccount);
      }
    },
    [accounts, match, global, history, location, activeUser]
  );

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

      let query = `${value} author:${global.tag.substring(1)} type:post`;

      if (global.filter === "comments") {
        query.replace("type:post", "type:comment");
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

  const getMetaProps = () => {
    const username = match.params.username.replace("@", "");
    const account = accounts.find((x) => x.name === username);
    const { section = ProfileFilter.blog } = match.params;
    const url = `${defaults.base}/@${username}${section ? `/${section}` : ""}`;
    const ncount = notifications.unread > 0 ? `(${notifications.unread}) ` : "";

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
    addAccount(updatedAccount);
    updateActiveUser(updatedAccount);

    setPinnedEntry(null);
    setPinnedEntry(entry);
  };
  return (
    <>
      <ScrollToTop />
      <Theme />
      <Feedback />
      <Navbar />

      <div className="app-content profile-page">
        <div className="profile-side">
          <ProfileCard account={account} section={section} />
        </div>
        <span itemScope={true} itemType="http://schema.org/Person">
          {account?.__loaded && (
            <meta itemProp="name" content={account.profile?.name || account.name} />
          )}
        </span>
        <div className="content-side">
          <ProfileMenu username={username} section={section} />

          {[...Object.keys(ProfileFilter), "communities"].includes(section) && (
            <ProfileCover account={account} />
          )}

          {data &&
            data.entries.length > 0 &&
            (filter === "blog" || filter === "posts" || filter === "comments") &&
            section === filter && (
              <div className="searchProfile">
                <SearchBox
                  placeholder={i18next.t("search-comment.search-placeholder")}
                  value={search}
                  onChange={handleChangeSearch}
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
                    <SearchListItem key={`${res.author}-${res.permlink}-${res.id}`} res={res} />
                  ))}
                </div>
              ) : (
                i18next.t("g.no-matches")
              )}
            </>
          ) : (
            <>
              {section === "wallet" && <WalletHive account={account} />}
              {(() => {
                if (section === "engine") {
                  return WalletHiveEngine({ ...props, account, updateWalletValues: ensureAccount });
                }
                if (section === "spk") {
                  return WalletSpk({
                    ...props,
                    account,
                    isActiveUserWallet: account.name === activeUser?.username
                  });
                }
                if (section === "points") {
                  return WalletEcency({ ...props, account, updateWalletValues: ensureAccount });
                }
                if (section === "communities") {
                  return ProfileCommunities({ ...props, account });
                }
                if (section === "settings") {
                  return <ProfileSettings account={account} />;
                }
                if (section === "referrals") {
                  return <ProfileReferrals account={account} />;
                }

                if (section === "permissions" && activeUser) {
                  if (account.name === activeUser.username) {
                    return (
                      <>
                        <div className="permission-menu">
                          <div className="permission-menu-items">
                            <h6
                              className={
                                tabState === 1
                                  ? "border-b border-[--border-color] pb-3 tab current-tab"
                                  : "tab"
                              }
                              onClick={() => setTabState(1)}
                            >
                              {i18next.t("manage-authorities.title")}
                            </h6>
                          </div>
                          <div className="permission-menu-items">
                            <h6
                              className={
                                tabState === 2
                                  ? "border-b border-[--border-color] pb-3 tab current-tab"
                                  : "tab"
                              }
                              onClick={() => setTabState(2)}
                            >
                              {i18next.t("account-recovery.title")}
                            </h6>
                          </div>
                          <div className="permission-menu-items">
                            <h6
                              className={
                                tabState === 3
                                  ? "border-b border-[--border-color] pb-3 tab current-tab"
                                  : "tab"
                              }
                              onClick={() => setTabState(3)}
                            >
                              {i18next.t("password-update.title")}
                            </h6>
                          </div>
                        </div>
                        <div className="container-fluid">
                          {tabState === 1 && <ManageAuthorities />}
                          <div className="grid grid-cols-12 pb-4">
                            <div className="col-span-12 sm:col-span-6">
                              {tabState === 2 && <AccountRecovery />}
                              {tabState === 3 && <PasswordUpdate />}
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  } else {
                    router.push(`/@${account.name}`);
                  }
                }

                if (section === "trail") {
                  return (
                    <>
                      <div className={`entry-list ${loading ? "loading" : ""}`}>
                        <div
                          className={`entry-list-body ${
                            listStyle === ListStyle.grid ? "grid-view" : ""
                          }`}
                        >
                          <CurationTrail account={account} section={section} />
                        </div>
                      </div>
                    </>
                  );
                }

                return <ProfileEntriesList section={section} account={account} />;
              })()}
            </>
          )}
        </div>
      </div>
    </>
  );
}
