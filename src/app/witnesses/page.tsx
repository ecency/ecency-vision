import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Navbar, ScrollToTop, Theme } from "@/features/shared";
import "./page.scss";
import { prefetchWitnessesQuery } from "@/api/queries";
import { WitnessesHeader, WitnessesList } from "@/app/witnesses/_components";
import { getPristineQueryClient } from "@/core/react-query";

export default async function Witnesses() {
  const queryClient = getPristineQueryClient();
  await prefetchWitnessesQuery(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScrollToTop />
      <Theme />
      <Navbar />
      <div className="app-content witnesses-page">
        <WitnessesHeader />
        <WitnessesList />
      </div>
    </HydrationBoundary>
  );
}
