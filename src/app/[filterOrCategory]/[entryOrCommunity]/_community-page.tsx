import "./community.scss";
import { getCommunityCache } from "@/core/caches";
import { Feedback, Navbar, ScrollToTop, Theme } from "@/features/shared";
import {
  CommunityCard,
  CommunityCover,
  CommunityMenu,
  JoinCommunityModal
} from "@/app/[filterOrCategory]/[entryOrCommunity]/_components";
import defaults from "@/defaults.json";
import { CommunityContent } from "@/app/[filterOrCategory]/[entryOrCommunity]/_components/community-content";
import {
  getAccountFullQuery,
  prefetchGetPostsFeedQuery,
  prefetchSearchApiQuery
} from "@/api/queries";
import Head from "next/head";
import i18next from "i18next";
import { capitalize } from "@/utils";
import { notFound } from "next/navigation";
import { getQueryClient } from "@/core/react-query";

interface Props {
  params: { filterOrCategory: string; entryOrCommunity: string };
  searchParams: Record<string, string | undefined>;
}

export default async function CommunityPage({ params, searchParams }: Props) {
  const community = await getCommunityCache(params.entryOrCommunity).prefetch();
  const account = await getAccountFullQuery(params.entryOrCommunity).prefetch();

  if (!community || !account) {
    return notFound();
  }

  const data = await prefetchGetPostsFeedQuery(params.filterOrCategory, params.entryOrCommunity);

  if (searchParams.q) {
    await prefetchSearchApiQuery(getQueryClient(), searchParams.q, "newest", "0");
  }

  // TODO: Add notification count to title in client side
  const metaTitle = `${community!!.title.trim()} community ${params.filterOrCategory} list`;
  const metaDescription = i18next.t("community.page-description", {
    f: `${capitalize(params.filterOrCategory)} ${community!!.title.trim()}`
  });
  const metaUrl = `/${params.filterOrCategory}/${community!!.name}`;
  const metaRss = `${defaults.base}/${params.filterOrCategory}/${community!!.name}/rss.xml`;
  const metaImage = `${defaults.imageServer}/u/${community!!.name}/avatar/medium`;
  const metaCanonical = `${defaults.base}/created/${community!!.name}`;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:url" content={metaUrl} />
        <link rel="canonical" href={metaCanonical} />
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href={metaRss} />
      </Head>
      <JoinCommunityModal community={community} communityId={searchParams.communityid} />
      <ScrollToTop />
      <Theme />
      <Feedback />
      <Navbar />
      <div className="app-content community-page">
        <div className="profile-side">
          <CommunityCard account={account} community={community} />
        </div>
        <span itemScope={true} itemType="http://schema.org/Organization">
          <meta itemProp="name" content={community.title.trim() || community.name} />
          <span itemProp="logo" itemScope={true} itemType="http://schema.org/ImageObject">
            <meta itemProp="url" content={metaUrl} />
          </span>
          <meta itemProp="url" content={`${defaults.base}${metaUrl}`} />
        </span>
        <div className="content-side">
          <CommunityMenu community={community} filter={params.filterOrCategory} />
          <CommunityCover account={account!!} community={community} />
          <CommunityContent
            community={community}
            query={searchParams.q}
            tag={params.entryOrCommunity}
            filter={params.filterOrCategory}
            section={searchParams.section ?? ""}
          />
        </div>
      </div>
    </>
  );
}
