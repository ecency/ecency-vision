import { SubmitWithProvidersPage } from "@/app/submit/_page";

export const dynamic = "force-dynamic";

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
