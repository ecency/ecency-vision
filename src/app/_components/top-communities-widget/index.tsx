"use client";

import React, { Fragment, useMemo } from "react";
import "./_index.scss";
import { Community } from "@/entities";
import { getCommunitiesQuery } from "@/api/queries";
import i18next from "i18next";
import { LinearProgress } from "@/features/shared";
import { CommunityListItem } from "@/app/communities/_components";

export const TopCommunitiesWidget = () => {
  const { data, isLoading: loading } = getCommunitiesQuery("rank").useClientQuery();
  const list = useMemo(() => {
    if (!data) {
      return [];
    }

    const result: Community[] = [];
    while (result.length < 5) {
      const index = Math.floor(Math.random() * (data.length - 1));
      if (result.every((item) => data[index].id !== item.id)) {
        result.push(data[index]);
      }
    }
    return result;
  }, [data]);

  return (
    <div className="top-communities-widget">
      <div className="top-communities-widget-header">
        <div className="title flex items-center">{i18next.t("top-communities.title")}</div>
        {loading && <LinearProgress />}
        <div className="list-items">
          {list.length === 0 && !loading && (
            <div className="no-results">{i18next.t("communities.no-results")}</div>
          )}
          {list.map((x, i) => (
            <Fragment key={i}>
              <CommunityListItem community={x} small={true} />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
