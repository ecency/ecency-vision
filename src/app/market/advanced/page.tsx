import { MarketAdvancedPage } from "@/app/market/advanced/_page";
import { Metadata, ResolvingMetadata } from "next";
import { PagesMetadataGenerator } from "@/features/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return PagesMetadataGenerator.getForPage("market-advanced");
}

export default function Page() {
  return <MarketAdvancedPage />;
}
