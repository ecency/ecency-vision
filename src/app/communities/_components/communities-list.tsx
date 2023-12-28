"use client";

import { LinearProgress, SearchBox } from "@/features/shared";
import i18next from "i18next";
import { ChangeEvent, useMemo, useState } from "react";
import { FormControl } from "@ui/input";
import { CommunityListItem } from "@/app/communities/_components/community-list-item";
import { useCommunitiesQuery } from "@/api/queries";
import { useDebounce } from "react-use";

export function CommunitiesList() {
  const [query, setQuery] = useState("");
  const [fetchingQuery, setFetchingQuery] = useState("");
  const [sort, setSort] = useState("rank");

  const { data: list, isLoading } = useCommunitiesQuery(sort, fetchingQuery);

  const noResults = useMemo(() => !isLoading && list.length === 0, [isLoading, list]);

  useDebounce(() => setFetchingQuery(query), 1000, [query]);

  return (
    <>
      <div className="list-form">
        <div className="search">
          <SearchBox
            placeholder={i18next.t("g.search")}
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            readOnly={isLoading}
          />
        </div>
        <div className="sort">
          <FormControl
            type="select"
            value={sort}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value)}
            disabled={isLoading}
          >
            <option value="hot">{i18next.t("communities.sort-hot")}</option>
            <option value="rank">{i18next.t("communities.sort-rank")}</option>
            <option value="subs">{i18next.t("communities.sort-subs")}</option>
            <option value="new">{i18next.t("communities.sort-new")}</option>
          </FormControl>
        </div>
      </div>
      {isLoading && <LinearProgress />}
      <div className="list-items">
        {noResults && <div className="no-results">{i18next.t("communities.no-results")}</div>}
        {list.map((x, i) => (
          <CommunityListItem community={x} key={x.name} />
        ))}
      </div>
    </>
  );
}
