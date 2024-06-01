import React, { useMemo } from "react";
import { setProxyBase } from "@ecency/render-helper";
import "./_index.scss";
import defaults from "@/defaults.json";
import i18next from "i18next";
import { CommunityCoverEditImage } from "@/app/[filterOrCategory]/[entryOrCommunity]/_components/community-cover-edit-image";
import { SubscriptionBtn } from "@/app/communities/_components";
import { CommunityPostBtn } from "@/app/[filterOrCategory]/[entryOrCommunity]/_components/community-post-btn";
import { Account, Community, FullAccount } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { formattedNumber } from "@/utils";

setProxyBase(defaults.imageServer);

const coverFallbackDay = require("../../img/cover-fallback-day.png");
const coverFallbackNight = require("../../img/cover-fallback-night.png");

interface Props {
  community: Community;
  account: Account;
}

export function CommunityCover({ community, account }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const users = useGlobalStore((state) => state.users);
  const theme = useGlobalStore((state) => state.theme);
  const canUseWebp = useGlobalStore((state) => state.canUseWebp);

  const style = useMemo(() => {
    let img = theme === "day" ? coverFallbackDay : coverFallbackNight;
    if (community) {
      img = `https://images.ecency.com/${canUseWebp ? "webp/" : ""}u/${community.name}/cover`;
    }

    return img ? { backgroundImage: `url('${img}')` } : {};
  }, [theme, community, canUseWebp]);
  const subscribers = useMemo(
    () => formattedNumber(community.subscribers, { fractionDigits: 0 }),
    [community.subscribers]
  );
  const rewards = useMemo(
    () => formattedNumber(community.sum_pending, { fractionDigits: 0 }),
    [community.sum_pending]
  );
  const authors = useMemo(
    () => formattedNumber(community.num_authors, { fractionDigits: 0 }),
    [community.num_authors]
  );
  const canUpdateCoverImage = useMemo(
    () => activeUser && !!users.find((x) => x.username === community.name),
    [activeUser, users, community.name]
  );

  return (
    <div className="community-cover">
      <div className="cover-image" style={style} />
      <div className="community-stats">
        <div className="community-stat">
          <div className="stat-value">{subscribers}</div>
          <div className="stat-label">{i18next.t("community.subscribers")}</div>
        </div>
        <div className="community-stat">
          <div className="stat-value">
            {"$"} {rewards}
          </div>
          <div className="stat-label">{i18next.t("community-cover.rewards")}</div>
        </div>
        <div className="community-stat">
          <div className="stat-value">{authors}</div>
          <div className="stat-label">{i18next.t("community-cover.authors")}</div>
        </div>
        {community.lang.trim() !== "" && (
          <div className="community-stat">
            <div className="stat-value">{community.lang.toUpperCase()}</div>
            <div className="stat-label">{i18next.t("community-cover.lang")}</div>
          </div>
        )}
      </div>

      <div className="controls-holder flex gap-3 px-3">
        <SubscriptionBtn community={community} />
        <CommunityPostBtn community={community} />
      </div>
      {canUpdateCoverImage && <CommunityCoverEditImage account={account as FullAccount} />}
    </div>
  );
}
