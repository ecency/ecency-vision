"use client";

import React, { useMemo } from "react";
import "./entry-index.scss";
import { useGlobalStore } from "@/core/global-store";
import {
  DetectBottom,
  EntryListContent,
  EntryListLoadingItem,
  LinearProgress
} from "@/features/shared";
import { ListStyle } from "@/enums";
import { TrendingTagsCard } from "@/app/_components/trending-tags-card";
import { EntryIndexMenu } from "@/app/_components/entry-index-menu";
import { usePostsFeedQuery } from "@/api/queries";
import { Entry } from "@/entities";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "@/utils/local-storage";
import { MarketData } from "@/app/_components/market-data";
import { TopCommunitiesWidget } from "@/app/_components/top-communities-widget";
import useMount from "react-use/lib/useMount";

interface Props {
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
}

export function EntryIndex({ loading, setLoading }: Props) {
  const isMobile = useGlobalStore((s) => s.isMobile);
  const activeUser = useGlobalStore((s) => s.activeUser);
  const listStyle = useGlobalStore((s) => s.listStyle);
  const filter = useGlobalStore((s) => s.filter);
  const tag = useGlobalStore((s) => s.tag);

  const [noReblog, setNoReblog] = useLocalStorage(PREFIX + "my_reblog", false);

  const { data, fetchNextPage, refetch } = usePostsFeedQuery(filter, tag);
  const entryList = useMemo(
    () => data?.pages?.reduce<Entry[]>((acc, p) => [...acc, ...(p as Entry[])], []) ?? [],
    [data?.pages]
  );

  const handleFilterReblog = () => setNoReblog((value) => !value);

  useMount(() => refetch());

  return (
    <>
      <div className="app-content overflow-hidden entry-index-page">
        <div className="tags-side">{!isMobile && <TrendingTagsCard />}</div>
        <div className={`entry-page-content ${loading ? "loading" : ""}`}>
          <div className="page-tools">
            <EntryIndexMenu noReblog={noReblog!!} handleFilterReblog={handleFilterReblog} />
          </div>
          {loading && entryList.length === 0 ? <LinearProgress /> : ""}
          <div className={`entry-list ${loading ? "loading" : ""}`}>
            <div
              className={`entry-list-body limited-area ${
                listStyle === ListStyle.grid ? "grid-view" : ""
              }`}
            >
              {loading && entryList.length === 0 && <EntryListLoadingItem />}
              <EntryListContent
                loading={loading}
                entries={entryList}
                sectionParam=""
                isPromoted={true}
              />
            </div>
          </div>
          {loading && entryList.length > 0 ? <LinearProgress /> : ""}
        </div>
        <div className="side-menu">
          {!isMobile && !activeUser && <MarketData />}
          {!isMobile && <TopCommunitiesWidget />}
        </div>
      </div>
      <DetectBottom onBottom={() => fetchNextPage({})} />
    </>
  );
}
