import "./page.scss";
import { Navbar, ScrollToTop, Theme } from "@/features/shared";
import { useGlobalStore } from "@/core/global-store";
import { Metadata } from "next";
import i18next from "i18next";
import { FullHeight } from "@/features/ui";
import {
  DiscoverContributors,
  DiscoverCuration,
  DiscoverLeaderboard
} from "@/app/discover/_components";
import {
  prefetchContributorsQuery,
  prefetchDiscoverCurationQuery,
  prefetchDiscoverLeaderboardQuery
} from "@/api/queries";
import { QueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { LeaderBoardDuration } from "@/entities";

export const metadata: Metadata = {
  title: i18next.t("discover.title"),
  description: i18next.t("discover.description")
};

export default async function Discover() {
  const usePrivate = useGlobalStore((state) => state.usePrivate);
  const params = useSearchParams();
  await prefetchDiscoverLeaderboardQuery(
    new QueryClient(),
    (params.get("period") as LeaderBoardDuration) ?? "day"
  );
  await prefetchDiscoverCurationQuery(
    new QueryClient(),
    (params.get("period") as LeaderBoardDuration) ?? "day"
  );
  await prefetchContributorsQuery(new QueryClient());

  return (
    <>
      <ScrollToTop />
      <FullHeight />
      <Theme />
      <Navbar />

      <div className="app-content discover-page">
        {usePrivate && (
          <div className="top-users">
            <DiscoverLeaderboard />
          </div>
        )}
        {usePrivate && (
          <div className="curation-users">
            <DiscoverCuration />
          </div>
        )}
        <div className="popular-users">
          <DiscoverContributors />
        </div>
      </div>
    </>
  );
}
