import React, { Fragment, useMemo, useState } from "react";
import numeral from "numeral";
import moment from "moment";
import "./_index.scss";
import { DetectBottom, LinearProgress, SearchListItem } from "@/features/shared";
import i18next from "i18next";
import { SearchAdvancedForm } from "@/app/search/_components/search-advanced-form";
import { getSearchApiQuery } from "@/api/queries";
import { useSearchParams } from "next/navigation";
import { SearchResult } from "@/entities";

enum SearchSort {
  POPULARITY = "popularity",
  NEWEST = "newest",
  RELEVANCE = "relevance"
}

enum DateOpt {
  W = "week",
  M = "month",
  Y = "year",
  A = "all"
}

interface Props {
  disableResults?: boolean;
}

export function SearchComment({ disableResults }: Props) {
  const [advanced, setAdvanced] = useState(false);

  const params = useSearchParams();

  const since = useMemo(() => {
    let sinceDate;
    switch (params.get("date") ?? DateOpt.M) {
      case DateOpt.W:
        sinceDate = moment().subtract("1", "week");
        break;
      case DateOpt.M:
        sinceDate = moment().subtract("1", "month");
        break;
      case DateOpt.Y:
        sinceDate = moment().subtract("1", "year");
        break;
      default:
        sinceDate = undefined;
    }

    return sinceDate?.format("YYYY-MM-DDTHH:mm:ss");
  }, [params]);

  const {
    data: resultsPages,
    isLoading,
    fetchNextPage
  } = getSearchApiQuery(
    params.get("q") ?? "",
    params.get("sort") ?? SearchSort.NEWEST,
    params.get("hd") !== "0",
    since
  ).useClientQuery();
  const results = useMemo(
    () =>
      resultsPages?.pages?.reduce<SearchResult[]>((acc, page) => [...acc, ...page.results], []) ??
      [],
    [resultsPages]
  );
  const hits = useMemo(
    () => resultsPages?.pages?.[resultsPages?.pages?.length - 1]?.hits ?? 0,
    [resultsPages?.pages]
  );

  return (
    <div className="border dark:border-dark-400 overflow-hidden bg-white rounded search-comment">
      <div className="bg-gray-100 dark:bg-dark-200 border-b dark:border-dark-400 p-3 flex justify-between items-center">
        <div>
          <strong>{i18next.t("search-comment.title")}</strong>
          {(() => {
            if (hits === 1) {
              return (
                <span className="matches">{i18next.t("search-comment.matches-singular")}</span>
              );
            }

            if (hits > 1) {
              const strHits = numeral(hits).format("0,0");
              return (
                <span className="text-sm text-gray-600 pl-3">
                  {i18next.t("search-comment.matches", { n: strHits })}
                </span>
              );
            }

            return null;
          })()}
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setAdvanced(!advanced);
          }}
        >
          {advanced ? i18next.t("g.close") : i18next.t("search-comment.advanced")}
        </a>
      </div>
      <div className="p-4">
        <SearchAdvancedForm />
        {(() => {
          if (results.length > 0 && !disableResults) {
            return (
              <div className="search-list">
                {results.map((res) => (
                  <Fragment key={`${res.author}-${res.permlink}`}>
                    <SearchListItem res={res} />
                  </Fragment>
                ))}

                <div className="show-more">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      fetchNextPage();
                    }}
                  >
                    {i18next.t("search-comment.show-more")}
                  </a>
                </div>
              </div>
            );
          }

          if (!isLoading) {
            return <span>{i18next.t("g.no-matches")}</span>;
          }

          return null;
        })()}

        {!disableResults && isLoading && <LinearProgress />}
      </div>
      <DetectBottom onBottom={() => fetchNextPage()} />
    </div>
  );
}
