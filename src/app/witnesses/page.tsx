import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Navbar, ScrollToTop, Theme } from "@/features/shared";
import "./page.scss";
import { getWitnessesQuery } from "@/api/queries";
import { WitnessesHeader, WitnessesList } from "@/app/witnesses/_components";
import { getQueryClient } from "@/core/react-query";
import { Metadata, ResolvingMetadata } from "next";
import { PagesMetadataGenerator } from "@/features/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return PagesMetadataGenerator.getForPage("witnesses");
}

export default async function Witnesses() {
  await getWitnessesQuery(50).prefetch();

  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
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
