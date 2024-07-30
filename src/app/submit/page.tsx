import { SubmitWithProvidersPage } from "@/app/submit/_page";
import { Metadata, ResolvingMetadata } from "next";
import { PagesMetadataGenerator } from "@/features/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return PagesMetadataGenerator.getForPage("submit");
}

export default function SubmitPage() {
  return (
    <SubmitWithProvidersPage
      permlink={undefined}
      username={undefined}
      draftId={undefined}
      path="/submit"
    />
  );
}
