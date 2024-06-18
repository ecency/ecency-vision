import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/core/react-query";
import CommunityPage from "@/app/[filterOrCategory]/[entryOrCommunity]/_community-page";

interface Props {
  params: { filterOrCategory: string; entryOrCommunity: string };
  searchParams: Record<string, string | undefined>;
}

export default function FilteredOrCategorizedPage({ params, searchParams }: Props) {
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <CommunityPage searchParams={searchParams} params={params} />
    </HydrationBoundary>
  );
}
