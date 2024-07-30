import "./community.scss";
import { getCommunityCache } from "@/core/caches";
import {
  CommunityCard,
  CommunityCover,
  CommunityMenu,
  JoinCommunityModal
} from "@/app/[...slugs]/_components";
import defaults from "@/defaults.json";
import { CommunityContent } from "@/app/[...slugs]/_components/community-content";
import { getAccountFullQuery, prefetchGetPostsFeedQuery } from "@/api/queries";
import { notFound } from "next/navigation";

interface Props {
  params: { filterOrCategory: string; entryOrCommunity: string };
  searchParams: Record<string, string | undefined>;
}

export async function CommunityPage({ params, searchParams }: Props) {
  const community = await getCommunityCache(params.entryOrCommunity).prefetch();
  const account = await getAccountFullQuery(params.entryOrCommunity).prefetch();

  if (!community || !account) {
    return notFound();
  }

  await prefetchGetPostsFeedQuery(params.filterOrCategory, params.entryOrCommunity);

  // TODO: Add notification count to title in client side
  const metaTitle = `${community!!.title.trim()} community ${params.filterOrCategory} list`;
  const metaUrl = `/${params.filterOrCategory}/${community!!.name}`;

  return (
    <>
      <JoinCommunityModal community={community} communityId={searchParams.communityid} />
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
