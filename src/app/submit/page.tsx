import { SubmitWithProvidersPage } from "@/app/submit/_page";
import { Metadata, ResolvingMetadata } from "next";
import { PagesMetadataGenerator } from "@/features/metadata";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Record<string, string | undefined>;
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  return PagesMetadataGenerator.getForPage("submit");
}

export default function SubmitPage(props: Props) {
  return (
    <SubmitWithProvidersPage
      permlink={undefined}
      username={undefined}
      draftId={undefined}
      path="/submit"
      searchParams={props.searchParams}
    />
  );
}
