import React from "react";
import "./_index.scss";
import { formattedNumber, vestsToHp } from "@/utils";
import { LinearProgress, ProfileLink, UserAvatar } from "@/features/shared";
import i18next from "i18next";
import { informationVariantSvg } from "@ui/svg";
import { Tooltip } from "@ui/tooltip";
import { DiscoverPeriodDropdown } from "@/app/discover/_components/discover-period-dropdown";
import { useDiscoverCurationQuery, useDynamicPropsQuery } from "@/api/queries";
import { useSearchParams } from "next/navigation";
import { CurationDuration } from "@/entities";

export function DiscoverCuration() {
  const { data: dynamicProps } = useDynamicPropsQuery();

  const params = useSearchParams();
  const { data, isLoading } = useDiscoverCurationQuery(
    (params.get("period") as CurationDuration) ?? "day"
  );

  return (
    <div className={i18next.t(`leaderboard-list ${isLoading ? "loading" : ""}`)}>
      <div className="list-header">
        <div className="list-filter">
          {i18next.t("leaderboard.title-curators")} {!isLoading && <DiscoverPeriodDropdown />}
        </div>
        <div className="list-title">{i18next.t(`leaderboard.title-${params.get("period")}`)}</div>
      </div>
      {isLoading && <LinearProgress />}
      {data.length > 0 && (
        <div className="list-body">
          <div className="list-body-header">
            <span />
            <Tooltip content={i18next.t("leaderboard.header-votes-tip")}>
              <div className="flex items-center">
                <span className="info-icon mr-1">{informationVariantSvg}</span>
                <span className="score">{i18next.t("leaderboard.header-votes")}</span>
              </div>
            </Tooltip>
            <span className="points">{i18next.t("leaderboard.header-reward")}</span>
          </div>

          {data.map((r, i) => (
            <div className="list-item" key={i}>
              <div className="index">{i + 1}</div>
              <div className="avatar">
                <ProfileLink username={r.account}>
                  <span>
                    <UserAvatar username={r.account} size="medium" />
                  </span>
                </ProfileLink>
              </div>
              <div className="username">
                <ProfileLink username={r.account}>
                  <span>{r.account}</span>
                </ProfileLink>
              </div>
              <div className="score">{r.votes}</div>
              <div className="points">
                {formattedNumber(vestsToHp(r.vests, dynamicProps.hivePerMVests), {
                  suffix: "HP"
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
