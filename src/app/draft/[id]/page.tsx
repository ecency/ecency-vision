import { SubmitWithProvidersPage } from "@/app/submit/_page";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default function DraftEditPage({ params: { id } }: Props) {
  return <SubmitWithProvidersPage path={`/draft/${id}`} draftId={id} />;
}
