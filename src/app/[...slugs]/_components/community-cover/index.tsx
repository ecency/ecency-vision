"use client";

import React, { useMemo } from "react";
import { setProxyBase } from "@ecency/render-helper";
import "./_index.scss";
import defaults from "@/defaults.json";
import i18next from "i18next";
import { CommunityCoverEditImage } from "@/app/[...slugs]/_components/community-cover-edit-image";
import { SubscriptionBtn } from "@/app/communities/_components";
import { Account, Community, FullAccount } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { formattedNumber } from "@/utils";
import { Button } from "@ui/button";
import Link from "next/link";
import { CommunityStatItem } from "@/app/[...slugs]/_components/community-cover/community-stat-item";

setProxyBase(defaults.imageServer);

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
    let img =
      theme === "day" ? "/assets/cover-fallback-day.png" : "/assets/cover-fallback-night.png";
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
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="bg-cover absolute top-0 left-0 w-full h-full bg-light-300 dark:bg-dark-default"
        style={style}
      />
      <div className="grid gap-4 md:gap-6 px-4 pb-4 md:px-6 md:pb-6 pt-16 md:pt-24 grid-cols-2 lg:grid-cols-4 w-full relative">
        <CommunityStatItem value={subscribers} label={i18next.t("community.subscribers")} />
        <CommunityStatItem value={"$" + rewards} label={i18next.t("community-cover.rewards")} />
        <CommunityStatItem value={authors} label={i18next.t("community-cover.authors")} />

        {community.lang.trim() !== "" && (
          <CommunityStatItem
            value={community.lang.toUpperCase()}
            label={i18next.t("community-cover.lang")}
          />
        )}
      </div>

      <div className="controls-holder absolute z-10 right-0 top-4 flex gap-2 px-2 md:px-4">
        <SubscriptionBtn community={community} />
        <Link href={`/submit?com=${community.name}`}>
          <Button>{i18next.t("community.post")}</Button>
        </Link>
      </div>
      {canUpdateCoverImage && <CommunityCoverEditImage account={account as FullAccount} />}
    </div>
  );
}
