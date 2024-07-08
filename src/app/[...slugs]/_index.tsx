import React from "react";
import "./entry-index.scss";
import { useGlobalStore } from "@/core/global-store";
import { EntryListContent } from "@/features/shared";
import { ListStyle } from "@/enums";
import { TrendingTagsCard } from "@/app/_components/trending-tags-card";
import { EntryIndexMenu } from "@/app/_components/entry-index-menu";
import { prefetchGetPostsFeedQuery } from "@/api/queries";
import { Entry } from "@/entities";
import { MarketData } from "@/app/_components/market-data";
import { TopCommunitiesWidget } from "@/app/_components/top-communities-widget";

export async function EntryIndex() {
  const isMobile = useGlobalStore((s) => s.isMobile);
  const activeUser = useGlobalStore((s) => s.activeUser);
  const listStyle = useGlobalStore((s) => s.listStyle);
  const filter = useGlobalStore((s) => s.filter);
  const tag = useGlobalStore((s) => s.tag);

  const data = await prefetchGetPostsFeedQuery(filter, tag);
  const entryList = data?.pages?.reduce<Entry[]>((acc, p) => [...acc, ...(p as Entry[])], []) ?? [];

  return (
    <>
      <div className="app-content overflow-hidden entry-index-page">
        <div className="tags-side">{!isMobile && <TrendingTagsCard />}</div>
        <div className="entry-page-content">
          <div className="page-tools">
            <EntryIndexMenu />
          </div>
          {/*{loading && entryList.length === 0 ? <LinearProgress /> : ""}*/}
          <div className="entry-list">
            <div
              className={`entry-list-body limited-area ${
                listStyle === ListStyle.grid ? "grid-view" : ""
              }`}
            >
              {/*{loading && entryList.length === 0 && <EntryListLoadingItem />}*/}
              <EntryListContent
                loading={false}
                entries={entryList}
                sectionParam={filter}
                isPromoted={true}
              />
            </div>
          </div>
          {/*{loading && entryList.length > 0 ? <LinearProgress /> : ""}*/}
        </div>
        <div className="side-menu">
          {!isMobile && !activeUser && <MarketData />}
          {!isMobile && <TopCommunitiesWidget />}
        </div>
      </div>
      {/*<DetectBottom onBottom={() => fetchNextPage({})} />*/}
    </>
  );
}
