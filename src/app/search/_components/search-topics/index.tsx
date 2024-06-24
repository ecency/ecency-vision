import React, { useMemo } from "react";
import defaults from "@/defaults.json";
import "./_index.scss";
import Link from "next/link";
import { makePath } from "@/utils";
import { LinearProgress } from "@/features/shared";
import i18next from "i18next";
import { useSearchParams } from "next/navigation";
import { SearchQuery } from "@/utils/search-query";
import { getSearchTopicsQuery } from "@/api/queries";

export function SearchTopics() {
  const params = useSearchParams();

  const q = useMemo(
    () => new SearchQuery(params.get("q") ?? "").search.split(" ")[0]?.replace("@", "") ?? "",
    [params]
  );

  const { data, isLoading } = getSearchTopicsQuery(q, 10).useClientQuery();

  return (
    <div className="border border-[--border-color] bg-white rounded  search-topics">
      <div className="bg-gray-100 dark:bg-dark-default border-b border-[--border-color] p-3">
        <strong>{i18next.t("search-topics.title")}</strong>
      </div>
      <div className="p-3">
        {(() => {
          if (isLoading) {
            return <LinearProgress />;
          }

          if (data?.length === 0) {
            return <span className="text-gray-600">{i18next.t("g.no-matches")}</span>;
          }

          return (
            <div className="topic-list">
              {data?.map((x) => {
                return (
                  <Link href={makePath(defaults.filter, x.tag)} className="list-item" key={x.tag}>
                    {x.tag}
                  </Link>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
