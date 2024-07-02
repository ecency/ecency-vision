import "./profile.scss";
import { Feedback, Navbar, ScrollToTop, Theme } from "@/features/shared";
import { ListStyle, ProfileFilter } from "@/enums";
import { SearchResult } from "@/entities";
import defaults from "@/defaults.json";
import {
  CurationTrail,
  ProfileCard,
  ProfileCommunities,
  ProfileCover,
  ProfileEntriesList,
  ProfileMenu,
  ProfileReferrals,
  ProfileSearch,
  ProfileSearchContent,
  ProfileSettings,
  WalletEcency,
  WalletHive,
  WalletHiveEngine,
  WalletSpk
} from "@/app/[filterOrCategory]/[entryOrCommunity]/_profile-components";
import { useGlobalStore } from "@/core/global-store";
import { getAccountFullQuery, getSearchApiQuery, prefetchGetPostsFeedQuery } from "@/api/queries";
import { notFound } from "next/navigation";
import Head from "next/head";
import "./profile.scss";
import { ProfilePermissions } from "@/app/[filterOrCategory]/[entryOrCommunity]/_profile-components/profile-permissions";

interface Props {
  params: { filterOrCategory: string; entryOrCommunity: string };
  searchParams: Record<string, string | undefined>;
}

export async function ProfilePage({
  params: { filterOrCategory: username, entryOrCommunity: section },
  searchParams: { q: searchParam }
}: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const listStyle = useGlobalStore((s) => s.listStyle);

  const account = await getAccountFullQuery(username).prefetch();
  await prefetchGetPostsFeedQuery(section, username);

  let searchData: SearchResult[] | undefined = undefined;
  if (searchParam && searchParam !== "") {
    const searchPages = await getSearchApiQuery(searchParam, "newest", false).prefetch();
    searchData = searchPages!!.pages[0].results.sort(
      (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
    );
  }

  if (!account) {
    return notFound();
  }

  const metaTitle = `${account.profile?.name || account.name}'s ${
    section ? (section === "engine" ? "tokens" : `${section}`) : ""
  } on decentralized web`;
  const metaDescription = `${
    account.profile?.about
      ? `${account.profile?.about} ${section ? `${section}` : ""}`
      : `${account.profile?.name || account.name} ${section ? `${section}` : ""}`
  }`;
  const metaUrl = `/@${username.replace("@", "")}${section ? `/${section}` : ""}`;
  const metaCanonical = `${defaults.base}/@${username.replace("@", "")}${
    section ? `/${section}` : ""
  }`;
  const metaRss = `${defaults.base}/@${username.replace("@", "")}/rss`;
  const metaKeywords = `${username.replace("@", "")}, ${username.replace("@", "")}'s blog`;
  const metaImage = `${defaults.imageServer}/u/${username.replace("@", "")}/avatar/medium`;

  return (
    <>
      <ScrollToTop />
      <Theme />
      <Feedback />
      <Navbar />
      <Head>
        {/*TODO: Add notification count to title*/}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:url" content={metaUrl} />
        <meta property="og:keywords" content={metaKeywords} />
        <link rel="canonical" href={metaCanonical} />
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href={metaRss} />
      </Head>

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
          <ProfileSearch section={section} username={username} />

          {searchData && searchData.length > 0 ? (
            <ProfileSearchContent items={searchData} />
          ) : (
            <>
              {section === "wallet" && <WalletHive account={account} />}
              {section === "engine" && <WalletHiveEngine account={account} />}
              {section === "spk" && (
                <WalletSpk
                  account={account}
                  isActiveUserWallet={account.name === activeUser?.username}
                />
              )}
              {section === "points" && <WalletEcency account={account} />}
              {section === "communities" && <ProfileCommunities account={account} />}
              {section === "settings" && <ProfileSettings account={account} />}
              {section === "referrals" && <ProfileReferrals account={account} />}
              {section === "permissions" && activeUser && <ProfilePermissions />}
              {section === "trail" && (
                <>
                  <div className="entry-list">
                    <div
                      className={`entry-list-body ${
                        listStyle === ListStyle.grid ? "grid-view" : ""
                      }`}
                    >
                      <CurationTrail account={account} section={section} />
                    </div>
                  </div>
                </>
              )}
              {["", "posts", "comments", "replies"].includes(section) && (
                <ProfileEntriesList section={section} account={account} />
              )}
              {/*  TODO: Add fallback to / if there is nothing matches*/}
            </>
          )}
        </div>
      </div>
    </>
  );
}
