import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/core/react-query";
import CommunityPage from "@/app/[filterOrCategory]/[entryOrCommunity]/_community-page";

interface Props {
  params: { filterOrCategory: string; entryOrCommunity: string };
}

export default function FilteredOrCategorizedPage({ params }: Props) {
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <CommunityPage params={params} />
    </HydrationBoundary>
  );
}
