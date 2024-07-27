import React from "react";
import "./entry-index.scss";
import { useGlobalStore } from "@/core/global-store";
import { TrendingTagsCard } from "@/app/_components/trending-tags-card";
import { EntryIndexMenu } from "@/app/_components/entry-index-menu";
import { prefetchGetPostsFeedQuery } from "@/api/queries";
import { MarketData } from "@/app/_components/market-data";
import { TopCommunitiesWidget } from "@/app/_components/top-communities-widget";
import { FeedContent } from "@/app/[...slugs]/_feed-components";

interface Props {
  filter: string;
  tag: string;
}

export async function EntryIndex({ filter, tag }: Props) {
  const isMobile = useGlobalStore((s) => s.isMobile);
  const activeUser = useGlobalStore((s) => s.activeUser);

  await prefetchGetPostsFeedQuery(filter, tag);

  return (
    <>
      <div className="app-content overflow-hidden entry-index-page">
        <div className="tags-side">{!isMobile && <TrendingTagsCard />}</div>
        <div className="entry-page-content">
          <div className="page-tools">
            <EntryIndexMenu filter={filter} tag={tag} />
          </div>
          <FeedContent tag={tag} filter={filter} />
        </div>
        <div className="side-menu">
          {!isMobile && !activeUser && <MarketData />}
          {!isMobile && <TopCommunitiesWidget />}
        </div>
      </div>
    </>
  );
}
