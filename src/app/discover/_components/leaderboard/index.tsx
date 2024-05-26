import React from "react";
import "./_index.scss";
import i18next from "i18next";
import { classNameObject } from "@ui/util";
import { ProfileLink, UserAvatar } from "@/features/shared";
import { Tooltip } from "@ui/tooltip";
import { informationVariantSvg } from "@ui/svg";
import { DiscoverPeriodDropdown } from "@/app/discover/_components/discover-period-dropdown";
import { LeaderBoardDuration, LeaderBoardItem } from "@/entities";

interface Props {
  data?: LeaderBoardItem[];
  period?: LeaderBoardDuration;
}

export function DiscoverLeaderboard({ data, period }: Props) {
  return (
    <div
      className={classNameObject({
        "leaderboard-list": true
      })}
    >
      <div className="list-header">
        <div className="list-filter">
          <DiscoverPeriodDropdown />
        </div>
        <div className="list-title">{i18next.t(`leaderboard.title-${period ?? "day"}`)}</div>
      </div>
      {data && data.length > 0 && (
        <div className="list-body">
          <div className="list-body-header">
            <span />
            <Tooltip content={i18next.t("leaderboard.header-score-tip")}>
              <div className="flex items-center">
                <span className="info-icon mr-1">{informationVariantSvg}</span>
                <span className="score">{i18next.t("leaderboard.header-score")}</span>
              </div>
            </Tooltip>
            <span className="points">{i18next.t("leaderboard.header-reward")}</span>
          </div>

          {data.map((r, i) => {
            return (
              <div className="list-item" key={i}>
                <div className="index">{i + 1}</div>
                <div className="avatar">
                  <ProfileLink username={r._id}>
                    <UserAvatar size="medium" username={r._id} />
                  </ProfileLink>
                </div>
                <div className="username">
                  <ProfileLink username={r._id}>
                    <span>{r._id}</span>
                  </ProfileLink>
                </div>
                <div className="score">{r.count}</div>
                <div className="points">{r.points !== "0.000" && `${r.points} POINTS`}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
