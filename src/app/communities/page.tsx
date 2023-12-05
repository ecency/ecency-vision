"use client";

import { FormControl } from "@/features/ui";
import { LinearProgress, ScrollToTop, SearchBox } from "@/features/shared";
import i18next from "i18next";
import { Fragment, useMemo, useState } from "react";
import Link from "next/link";

export default function Communities() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [sort, setSort] = useState("");

  const noResults = useMemo(() => !loading && list.length === 0, [loading, list]);

  return (
    <>
      <ScrollToTop />
      <Theme global={this.props.global} />
      <NavBar history={this.props.history} />
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
                onChange={this.queryChanged}
                readOnly={loading}
              />
            </div>
            <div className="sort">
              <FormControl
                type="select"
                value={sort}
                onChange={this.sortChanged}
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
              <Fragment key={i}>
                {CommunityListItem({
                  ...this.props,
                  community: x
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
