"use client";

import React, { useState } from "react";
import "./_index.scss";
import { accountReputation, truncate } from "@/utils";
import { getAccountFull } from "@/api/hive";
import { BookmarkBtn, FollowControls, ProfileLink, Skeleton, UserAvatar } from "@/features/shared";
import { Entry } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import useMount from "react-use/lib/useMount";
import { FavouriteBtn } from "@/features/shared/favorite-btn";

interface Props {
  entry: Entry;
}

export const AuthorInfoCard = ({ entry }: Props) => {
  const isMobile = useGlobalStore((s) => s.isMobile);
  const usePrivate = useGlobalStore((s) => s.usePrivate);
  const activeUser = useGlobalStore((s) => s.activeUser);
  const reputation = accountReputation(entry.author_reputation);

  const [authorInfo, setAuthorInfo] = useState({
    name: "",
    about: ""
  });

  const [loading, setLoading] = useState(false);

  useMount(() => {
    !isMobile && getAuthorInfo();
  });

  // For fetching authors about and display name information
  const getAuthorInfo = async () => {
    setLoading(true);
    const _authorInfo = (await getAccountFull(entry.author))?.profile;

    setAuthorInfo({
      name: _authorInfo?.name || "",
      about: _authorInfo?.about || _authorInfo?.location || ""
    });
    setLoading(false);
  };

  return loading ? (
    <div className="avatar-fixed">
      <div className="flex items-center mb-4">
        <Skeleton className="avatar-skeleton rounded-[50%]" />
        <Skeleton className=" ml-3 text-skeleton" />
      </div>
      <Skeleton className="text-skeleton mb-3" />
      <Skeleton className="text-skeleton" />
    </div>
  ) : (
    <div className="avatar-fixed" id="avatar-fixed">
      <div className="first-line">
        <span className="avatar">
          <ProfileLink username={entry?.author}>
            <div className="author-avatar">
              <UserAvatar username={entry.author} size="medium" />
            </div>
          </ProfileLink>
        </span>
        <span className="user-info">
          <div className="info-line-1">
            <ProfileLink username={entry.author}>
              <div className="author notranslate">
                <span className="author-name">
                  <span itemProp="author" itemScope={true} itemType="http://schema.org/Person">
                    <span itemProp="name">{entry.author}</span>
                  </span>
                </span>
                {!isNaN(reputation) && <span className="author-reputation">({reputation})</span>}
              </div>
            </ProfileLink>
          </div>
        </span>
      </div>
      <div className="second-line">
        <div className="entry-tag">
          <div className="name">{authorInfo?.name}</div>
          {!!authorInfo?.about && (
            <p className="description">{`${truncate(authorInfo?.about, 130)}`}</p>
          )}
        </div>
      </div>
      <div className="social-wrapper">
        {entry.author && <FollowControls targetUsername={entry.author} where={"author-card"} />}

        {usePrivate && entry.author && entry.author !== activeUser?.username && (
          <FavouriteBtn targetUsername={entry.author} />
        )}

        {usePrivate && <BookmarkBtn entry={entry} />}
      </div>
    </div>
  );
};
