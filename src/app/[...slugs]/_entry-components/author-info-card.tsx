"use client";

import React from "react";
import { accountReputation, truncate } from "@/utils";
import { FollowControls, ProfileLink, UserAvatar } from "@/features/shared";
import { Entry } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { FavouriteBtn } from "@/features/shared/favorite-btn";
import { getAccountFullQuery } from "@/api/queries";
import { motion } from "framer-motion";

interface Props {
  entry: Entry;
}

export const AuthorInfoCard = ({ entry }: Props) => {
  const isMobile = useGlobalStore((s) => s.isMobile);
  const usePrivate = useGlobalStore((s) => s.usePrivate);
  const activeUser = useGlobalStore((s) => s.activeUser);
  const reputation = accountReputation(entry.author_reputation);

  const { data } = getAccountFullQuery(!isMobile ? entry.author : undefined).useClientQuery();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-[180px] flex-col gap-4 hidden md:flex"
    >
      <div className="flex items-center gap-4">
        <ProfileLink username={entry?.author}>
          <UserAvatar username={entry.author} size="medium" />
        </ProfileLink>
        <div className="flex flex-col">
          <ProfileLink username={entry.author}>
            <div className="text-sm notranslate">
              <span itemProp="author" itemScope={true} itemType="http://schema.org/Person">
                <span itemProp="name">{entry.author}</span>
              </span>
              {!isNaN(reputation) && <span className="author-reputation">({reputation})</span>}
            </div>
          </ProfileLink>
        </div>
      </div>
      <div className="font-semibold">{data?.profile?.name}</div>
      <div>{`${truncate(data?.profile?.about ?? data?.profile?.location ?? "", 130)}`}</div>

      <div className="flex items-center justify-start flex-wrap border-t pt-4 border[--border-color]">
        {entry.author && <FollowControls targetUsername={entry.author} where={"author-card"} />}
        {usePrivate && entry.author && entry.author !== activeUser?.username && (
          <FavouriteBtn targetUsername={entry.author} />
        )}
      </div>
    </motion.div>
  );
};
