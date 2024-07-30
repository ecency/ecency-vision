import "./profile.scss";
import { ListStyle, ProfileFilter } from "@/enums";
import { SearchResult } from "@/entities";
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
} from "@/app/[...slugs]/_profile-components";
import { useGlobalStore } from "@/core/global-store";
import {
  getAccountFullQuery,
  getDynamicPropsQuery,
  getSearchApiQuery,
  prefetchGetPostsFeedQuery
} from "@/api/queries";
import { notFound } from "next/navigation";
import { ProfilePermissions } from "@/app/[...slugs]/_profile-components/profile-permissions";

interface Props {
  username: string;
  section: string;
  searchParams: Record<string, string | undefined>;
}

export async function ProfilePage({
  username,
  section = "posts",
  searchParams: { query: searchParam }
}: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const listStyle = useGlobalStore((s) => s.listStyle);

  const account = await getAccountFullQuery(username).prefetch();
  await prefetchGetPostsFeedQuery(section, `@${username}`);
  await getDynamicPropsQuery().prefetch();

  let searchData: SearchResult[] | undefined = undefined;
  if (searchParam && searchParam !== "") {
    const searchPages = await getSearchApiQuery(
      `${searchParam} author:${username} type:post`,
      "newest",
      false
    ).prefetch();
    searchData = searchPages!!.pages[0].results.sort(
      (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
    );
  }

  if (!account) {
    return notFound();
  }

  return (
    <>
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
              {section === "permissions" && <ProfilePermissions />}
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
              {["", "posts", "comments", "replies", "blog"].includes(section) && (
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
