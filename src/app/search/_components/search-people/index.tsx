import React, { useMemo } from "react";
import "./_index.scss";
import { LinearProgress, ProfileLink, UserAvatar } from "@/features/shared";
import i18next from "i18next";
import { useSearchParams } from "next/navigation";
import { getSearchAccountQuery } from "@/api/queries";
import { SearchQuery } from "@/utils/search-query";
import { truncate } from "@/utils";

export function SearchPeople() {
  const params = useSearchParams();

  const q = useMemo(
    () => new SearchQuery(params.get("q") ?? "").search.split(" ")[0]?.replace("@", "") ?? "",
    [params]
  );
  const { data: results, isLoading } = getSearchAccountQuery(q).useClientQuery();

  return (
    <div className="border border-[--border-color] bg-white rounded  search-people">
      <div className="bg-gray-100 dark:bg-dark-default border-b border-[--border-color] p-3">
        <strong>{i18next.t("search-people.title")}</strong>
      </div>
      <div className="p-3">
        {(() => {
          if (isLoading) {
            return <LinearProgress />;
          }

          if (results?.length === 0) {
            return <span className="text-gray-600">{i18next.t("g.no-matches")}</span>;
          }

          return (
            <div className="people-list">
              <div className="list-body">
                {results?.map((i) => {
                  const username = i.name;
                  return (
                    <div className="list-item" key={username}>
                      <div className="item-header">
                        <ProfileLink username={username}>
                          <UserAvatar username={username} size="medium" />
                        </ProfileLink>
                        <div className="item-title">
                          <ProfileLink username={username}>
                            <span className="item-name notranslate">{i.full_name}</span>
                          </ProfileLink>
                          <span className="item-sub-title">
                            {"@"}
                            {i.name}
                          </span>
                        </div>
                      </div>
                      <div className="item-about">{truncate(i.about, 120)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
