import React, { useMemo } from "react";
import "./_index.scss";
import i18next from "i18next";
import { LinearProgress, UserAvatar } from "@/features/shared";
import { formattedNumber, makePath, truncate } from "@/utils";
import defaults from "@/defaults.json";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SearchQuery } from "@/utils/search-query";
import { getCommunitiesQuery } from "@/api/queries";

interface Props {
  history: History;
  location: Location;
  global: Global;
}

export function SearchCommunities() {
  const params = useSearchParams();

  const q = useMemo(
    () => new SearchQuery(params.get("q") ?? "").search.split(" ")[0]?.replace("@", "") ?? "",
    [params]
  );
  const { isLoading, data } = getCommunitiesQuery("rank", q, 4).useClientQuery();

  return (
    <div className="border border-[--border-color] bg-white rounded search-communities">
      <div className="bg-gray-100 dark:bg-dark-default border-b border-[--border-color] p-3">
        <strong>{i18next.t("search-communities.title")}</strong>
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
            <div className="community-list">
              {data?.map((community) => {
                const link = makePath(defaults.filter, community.name);

                const nOpts = { fractionDigits: 0 };
                const subscribers = formattedNumber(community.subscribers, nOpts);

                return (
                  <div key={community.name} className="list-item">
                    <div className="item-header">
                      <Link href={link}>
                        <UserAvatar username={community.name} size="medium" />
                      </Link>
                      <div className="item-title">
                        <Link href={link}>{community.title}</Link>

                        <div className="item-sub-title">
                          {i18next.t("communities.n-subscribers", { n: subscribers })}
                        </div>
                      </div>
                    </div>
                    <div className="item-about">{truncate(community.about, 120)}</div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
