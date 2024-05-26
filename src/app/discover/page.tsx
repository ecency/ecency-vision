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
  prefetchDiscoverLeaderboardQuery,
  prefetchDynamicPropsQuery
} from "@/api/queries";
import { CurationDuration, LeaderBoardDuration } from "@/entities";
import { getPristineQueryClient } from "@/core/react-query";

export const metadata: Metadata = {
  title: i18next.t("discover.title"),
  description: i18next.t("discover.description")
};

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default async function Discover({ searchParams }: Props) {
  const usePrivate = useGlobalStore((state) => state.usePrivate);
  const client = getPristineQueryClient();

  const dynamicProps = await prefetchDynamicPropsQuery(client);
  const leaderboardData = await prefetchDiscoverLeaderboardQuery(
    client,
    (searchParams["period"] as LeaderBoardDuration) ?? "day"
  );
  const curationData = await prefetchDiscoverCurationQuery(
    client,
    (searchParams["period"] as LeaderBoardDuration) ?? "day"
  );
  await prefetchContributorsQuery(client);

  return (
    <>
      <ScrollToTop />
      <FullHeight />
      <Theme />
      <Navbar />

      <div className="app-content discover-page">
        {usePrivate && (
          <div className="top-users">
            <DiscoverLeaderboard
              data={leaderboardData}
              period={searchParams["period"] as LeaderBoardDuration}
            />
          </div>
        )}
        {usePrivate && (
          <div className="curation-users">
            <DiscoverCuration
              dynamicProps={dynamicProps}
              data={curationData}
              period={searchParams["period"] as CurationDuration}
            />
          </div>
        )}
        <div className="popular-users">
          <DiscoverContributors />
        </div>
      </div>
    </>
  );
}
