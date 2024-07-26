"use client";

import { useMemo } from "react";
import { DetectBottom, SearchListItem } from "@/features/shared";
import i18next from "i18next";
import { getSearchApiQuery } from "@/api/queries";
import { Community, SearchResult } from "@/entities";
import useMount from "react-use/lib/useMount";

interface Props {
  community: Community;
  query?: string;
}

export function CommunityContentSearchData({ query, community }: Props) {
  const { data, fetchNextPage, refetch } = getSearchApiQuery(
    query ? `${query} category:${community.name}` ?? "" : "",
    "newest",
    false
  ).useClientQuery();
  const searchData = useMemo(
    () =>
      data?.pages.reduce<SearchResult[]>(
        (acc, page) =>
          [...acc, ...page.results].sort(
            (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
          ),
        []
      ) ?? [],
    [data?.pages]
  );

  useMount(() => refetch());

  return searchData.length > 0 ? (
    <div className="search-list">
      {searchData.map((res) => (
        <SearchListItem key={`${res.author}-${res.permlink}-${res.id}`} res={res} />
      ))}
      <DetectBottom onBottom={() => fetchNextPage()} />
    </div>
  ) : searchData.length === 0 && query ? (
    i18next.t("g.no-matches")
  ) : (
    <></>
  );
}
