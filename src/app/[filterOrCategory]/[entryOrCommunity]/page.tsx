import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/core/react-query";
import CommunityPage from "@/app/[filterOrCategory]/[entryOrCommunity]/_community-page";
import { ProfilePage } from "@/app/[filterOrCategory]/[entryOrCommunity]/_profile-page";

interface Props {
  params: { filterOrCategory: string; entryOrCommunity: string };
  searchParams: Record<string, string | undefined>;
}

export default function FilteredOrCategorizedPage({ params, searchParams }: Props) {
  const isProfile = params.filterOrCategory.startsWith("@");

  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      {isProfile && <ProfilePage params={params} searchParams={searchParams} />}
      {!isProfile && <CommunityPage searchParams={searchParams} params={params} />}
    </HydrationBoundary>
  );
}
