import { MessageNoData } from "@/features/shared";
import i18next from "i18next";
import { isCommunity } from "@/utils";
import React from "react";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  section: string;
  loading: boolean;
  username: string;
}

export function EntryListContentNoData({ username, section, loading }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const isMyProfile =
    !!activeUser && username.includes("@") && activeUser.username === username.replace("@", "");

  return (
    !loading &&
    (isMyProfile && section !== "trail" ? (
      <MessageNoData
        title={
          section == "feed"
            ? `${i18next.t("g.nothing-found-in")} ${i18next.t(`g.${section}`)}`
            : i18next.t("profile-info.no-posts")
        }
        description={
          section == "feed"
            ? i18next.t("g.fill-feed")
            : `${i18next.t("g.nothing-found-in")} ${i18next.t(`g.${section}`)}`
        }
        buttonText={
          section == "feed" ? i18next.t("navbar.discover") : i18next.t("profile-info.create-posts")
        }
        buttonTo={section == "feed" ? "/discover" : "/submit"}
      />
    ) : isCommunity(username) ? (
      <MessageNoData
        title={i18next.t("profile-info.no-posts-community")}
        description={`${i18next.t("g.no")} ${i18next.t(`g.${section}`)} ${i18next.t("g.found")}.`}
        buttonText={i18next.t("profile-info.create-posts")}
        buttonTo={`/submit?cat=${username}`}
      />
    ) : username == "my" ? (
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
            : i18next.t(`g.${section}`)
        }.`}
        buttonText={isMyProfile ? i18next.t("profile-info.create-posts") : ""}
        buttonTo="/submit"
      />
    ))
  );
}
