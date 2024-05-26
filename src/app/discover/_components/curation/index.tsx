import React from "react";
import "./_index.scss";
import { formattedNumber, vestsToHp } from "@/utils";
import { ProfileLink, UserAvatar } from "@/features/shared";
import i18next from "i18next";
import { informationVariantSvg } from "@ui/svg";
import { Tooltip } from "@ui/tooltip";
import { CurationDuration, CurationItem, DynamicProps } from "@/entities";

interface Props {
  data?: CurationItem[];
  period?: CurationDuration;
  dynamicProps?: DynamicProps;
}

export async function DiscoverCuration({ data, period, dynamicProps }: Props) {
  return (
    <div className="leaderboard-list">
      <div className="list-header">
        <div className="list-filter">{i18next.t("leaderboard.title-curators")}</div>
        <div className="list-title">{i18next.t(`leaderboard.title-${period ?? "day"}`)}</div>
      </div>
      {data && data.length > 0 && (
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
                {formattedNumber(vestsToHp(r.vests, dynamicProps?.hivePerMVests ?? 1), {
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
