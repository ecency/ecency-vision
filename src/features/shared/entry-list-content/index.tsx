"use client";

import React from "react";
import "./_index.scss";
import { Entry } from "@/entities";
import { EntryListItem, MessageNoData } from "@/features/shared";
import { getMutedUsersQuery } from "@/api/queries/get-muted-users-query";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { isCommunity } from "@/utils";
import { getPromotedEntriesQuery } from "@/api/queries";

interface Props {
  loading: boolean;
  entries: Entry[];
  sectionParam: string;
  isPromoted: boolean;
}

export function EntryListContent({ sectionParam: section, loading, entries, isPromoted }: Props) {
  const tag = useGlobalStore((s) => s.tag);
  const filter = useGlobalStore((s) => s.filter);
  const activeUser = useGlobalStore((s) => s.activeUser);
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  const { data: mutedUsers } = getMutedUsersQuery(activeUser).useClientQuery();

  let dataToRender = [...entries];
  let promotedEntries: Entry[] = [];
  if (isPromoted) {
    const { data: promotedEntriesResponse } = getPromotedEntriesQuery(usePrivate).useClientQuery();
    promotedEntries = promotedEntriesResponse ?? [];
  }

  const isMyProfile =
    !!activeUser && tag.includes("@") && activeUser.username === tag.replace("@", "");
  const mutedList =
    mutedUsers && mutedUsers.length > 0 && activeUser && activeUser.username ? mutedUsers : [];

  return (
    <>
      {dataToRender.length > 0 ? (
        <>
          {dataToRender.map((e, i) => {
            const l = [];

            if (i % 4 === 0 && i > 0) {
              const ix = i / 4 - 1;

              if (promotedEntries?.[ix]) {
                const p = promotedEntries[ix];
                let isPostMuted =
                  (activeUser && activeUser.username && mutedList.includes(p.author)) || false;
                if (!dataToRender.find((x) => x.author === p.author && x.permlink === p.permlink)) {
                  l.push(
                    <EntryListItem
                      key={`${p.author}-${p.permlink}`}
                      entry={p}
                      promoted={true}
                      order={4}
                      muted={isPostMuted}
                    />
                  );
                }
              }
            }

            let isPostMuted =
              (activeUser && activeUser.username && mutedList.includes(e.author)) || false;
            if (isPromoted) {
              l.push(
                <EntryListItem
                  key={`${e.author}-${e.permlink}`}
                  entry={e}
                  order={i}
                  muted={isPostMuted}
                />
              );
            } else {
              l.push(
                <EntryListItem
                  key={`${e.author}-${e.permlink}`}
                  entry={e}
                  order={i}
                  muted={isPostMuted}
                />
              );
            }
            return [...l];
          })}
        </>
      ) : (
        !loading &&
        (isMyProfile && section !== "trail" ? (
          <MessageNoData
            title={
              filter == "feed"
                ? `${i18next.t("g.nothing-found-in")} ${i18next.t(`g.${filter}`)}`
                : i18next.t("profile-info.no-posts")
            }
            description={
              filter == "feed"
                ? i18next.t("g.fill-feed")
                : `${i18next.t("g.nothing-found-in")} ${i18next.t(`g.${filter}`)}`
            }
            buttonText={
              filter == "feed"
                ? i18next.t("navbar.discover")
                : i18next.t("profile-info.create-posts")
            }
            buttonTo={filter == "feed" ? "/discover" : "/submit"}
          />
        ) : isCommunity(tag) ? (
          <MessageNoData
            title={i18next.t("profile-info.no-posts-community")}
            description={`${i18next.t("g.no")} ${i18next.t(`g.${filter}`)} ${i18next.t(
              "g.found"
            )}.`}
            buttonText={i18next.t("profile-info.create-posts")}
            buttonTo="/submit"
          />
        ) : tag == "my" ? (
          <MessageNoData
            title={i18next.t("g.no-matches")}
            description={i18next.t("g.fill-community-feed")}
            buttonText={i18next.t("navbar.discover")}
            buttonTo="/communities"
          />
        ) : (
          <MessageNoData
            title={i18next.t("profile-info.no-posts-user")}
            description={`${i18next.t("g.nothing-found-in")} ${
              section === "trail"
                ? i18next.t(`g.trail`) + " " + i18next.t(`g.past-few-days`)
                : i18next.t(`g.${filter}`)
            }.`}
            buttonText={isMyProfile ? i18next.t("profile-info.create-posts") : ""}
            buttonTo="/submit"
          />
        ))
      )}
    </>
  );
}
