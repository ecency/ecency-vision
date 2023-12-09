"use client";

import { FormControl } from "@/features/ui";
import { LinearProgress, Navbar, ScrollToTop, SearchBox, Theme } from "@/features/shared";
import i18next from "i18next";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CommunityListItem } from "./_components";
import { Communities } from "@/entities";
import { useDebounce } from "react-use";
import { getCommunities } from "@/api/bridge";
import "./page.scss";

export default function Communities() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Communities>([]);
  const [sort, setSort] = useState("rank");

  const noResults = useMemo(() => !loading && list.length === 0, [loading, list]);

  useDebounce(() => fetch(), 1000, [query]);

  useEffect(() => {
    fetch();
  }, [sort]);

  const fetch = async () => {
    setLoading(true);

    try {
      const r = await getCommunities("", 100, query ? query : null, sort === "hot" ? "rank" : sort);
      if (r) {
        const list = sort === "hot" ? r.sort(() => Math.random() - 0.5) : r;
        setList(list);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollToTop />
      <Theme />
      <Navbar />
      <div className="app-content communities-page">
        <div className="community-list">
          <div className="list-header">
            <h1 className="list-title">{i18next.t("communities.title")}</h1>
            <Link href="/communities/create" className="create-link">
              {i18next.t("communities.create")}
            </Link>
          </div>
          <div className="list-form">
            <div className="search">
              <SearchBox
                placeholder={i18next.t("g.search")}
                value={query}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                readOnly={loading}
              />
            </div>
            <div className="sort">
              <FormControl
                type="select"
                value={sort}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value)}
                disabled={loading}
              >
                <option value="hot">{i18next.t("communities.sort-hot")}</option>
                <option value="rank">{i18next.t("communities.sort-rank")}</option>
                <option value="subs">{i18next.t("communities.sort-subs")}</option>
                <option value="new">{i18next.t("communities.sort-new")}</option>
              </FormControl>
            </div>
          </div>
          {loading && <LinearProgress />}
          <div className="list-items">
            {noResults && <div className="no-results">{i18next.t("communities.no-results")}</div>}
            {list.map((x, i) => (
              <CommunityListItem community={x} key={x.name} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
