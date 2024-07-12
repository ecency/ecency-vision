"use client";

import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import { getFollowingQuery } from "@/api/queries";
import { useMemo } from "react";
import { Entry } from "@/entities";

interface Props {
  entry: Entry;
}

export function EntryPageMightContainsMutedCommentsWarning({ entry }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { data: followings } = getFollowingQuery(
    activeUser?.username,
    "",
    "ignore",
    100
  ).useClientQuery();

  const isOwnEntry = useMemo(
    () => activeUser?.username === entry.author,
    [activeUser?.username, entry.author]
  );
  const isComment = useMemo(() => !!entry.author, [entry]);
  const entryIsMuted = useMemo(
    () => followings?.map((user) => user.following).includes(entry.author) ?? false,
    [entry.author, followings]
  );

  const mightContainMutedComments = !!activeUser && entryIsMuted && !isComment && !isOwnEntry;

  return mightContainMutedComments ? (
    <div className="hidden-warning">
      <span>{i18next.t("entry.comments-hidden")}</span>
    </div>
  ) : (
    <></>
  );
}
