import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { Navbar, ScrollToTop, Theme } from "@/features/shared";
import "./page.scss";
import { WitnessesHeader } from "@/app/witnesses/_components/witnesses-header";
import { prefetchWitnessesQuery } from "@/api/queries";
import { WitnessesList } from "@/app/witnesses/_components";

export default async function Witnesses() {
  const queryClient = new QueryClient();
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
