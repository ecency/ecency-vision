import React, { useMemo } from "react";
import "./_index.scss";
import { Entry } from "@/entities";
import { EntryListItem, LinearProgress, MessageNoData } from "@/features/shared";
import { useGetMutedUsersQuery } from "@/api/queries/get-muted-users-query";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { isCommunity } from "@/utils";
import { useGetPromotedEntriesQuery } from "@/api/queries";

interface Props {
  loading: boolean;
  entries: Entry[];
  sectionParam: string;
}

export function EntryListContent({ sectionParam: section, loading, entries }: Props) {
  const tag = useGlobalStore((s) => s.tag);
  const filter = useGlobalStore((s) => s.filter);
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { data: mutedUsers, isPending: isLoadingMutedUsers } = useGetMutedUsersQuery();
  const { data: promotedEntries } = useGetPromotedEntriesQuery();

  const isMyProfile = useMemo(
    () => !!activeUser && tag.includes("@") && activeUser.username === tag.replace("@", ""),
    [activeUser, tag]
  );
  const mutedList = useMemo(() => {
    if (mutedUsers && mutedUsers.length > 0 && activeUser && activeUser.username) {
      return mutedUsers;
    }
    return [];
  }, [activeUser, mutedUsers]);
  const dataToRender = useMemo(() => {
    let dataToRender = entries;
    if (location.pathname.includes("/promoted")) {
      dataToRender = promotedEntries ?? [];
    }

    return dataToRender;
  }, [entries, promotedEntries]);

  return (
    <>
      {isLoadingMutedUsers ? (
        <LinearProgress />
      ) : dataToRender.length > 0 ? (
        <>
          {dataToRender.map((e, i) => {
            const l = [];

            if (i % 4 === 0 && i > 0) {
              const ix = i / 4 - 1;

              if (promotedEntries[ix]) {
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
            if (location.pathname.includes("/promoted")) {
              l.push(
                <EntryListItem
                  key={`${e.author}-${e.permlink}`}
                  entry={e}
                  promoted={true}
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
            global={global}
          />
        ) : isCommunity(tag) ? (
          <MessageNoData
            title={i18next.t("profile-info.no-posts-community")}
            description={`${i18next.t("g.no")} ${i18next.t(`g.${filter}`)} ${i18next.t(
              "g.found"
            )}.`}
            buttonText={i18next.t("profile-info.create-posts")}
            buttonTo="/submit"
            global={global}
          />
        ) : tag == "my" ? (
          <MessageNoData
            title={i18next.t("g.no-matches")}
            description={i18next.t("g.fill-community-feed")}
            buttonText={i18next.t("navbar.discover")}
            buttonTo="/communities"
            global={global}
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
            global={global}
          />
        ))
      )}
    </>
  );
}
