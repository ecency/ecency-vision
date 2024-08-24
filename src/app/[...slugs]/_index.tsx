import React from "react";
import "./entry-index.scss";
import { useGlobalStore } from "@/core/global-store";
import { TrendingTagsCard } from "@/app/_components/trending-tags-card";
import { EntryIndexMenu } from "@/app/_components/entry-index-menu";
import { prefetchGetPostsFeedQuery } from "@/api/queries";
import { TopCommunitiesWidget } from "@/app/_components/top-communities-widget";
import { FeedContent } from "@/app/[...slugs]/_feed-components";
import { cookies } from "next/headers";
import { ACTIVE_USER_COOKIE_NAME } from "@/consts";

interface Props {
  filter: string;
  tag: string;
}

export async function EntryIndex({ filter, tag }: Props) {
  const isMobile = useGlobalStore((s) => s.isMobile);
  const cookiesStore = cookies();

  const observer = cookiesStore.get(ACTIVE_USER_COOKIE_NAME)?.value;
  await prefetchGetPostsFeedQuery(filter, tag, 20, observer);

  return (
    <>
      <div className="app-content overflow-hidden entry-index-page">
        <div className="tags-side">
          {!isMobile && <TrendingTagsCard filter={filter} tag={tag} />}
        </div>
        <div className="entry-page-content">
          <div className="page-tools">
            <EntryIndexMenu filter={filter} tag={tag} />
          </div>
          <FeedContent tag={tag} filter={filter} observer={observer} />
        </div>
        <div className="side-menu">{!isMobile && <TopCommunitiesWidget />}</div>
      </div>
    </>
  );
}
