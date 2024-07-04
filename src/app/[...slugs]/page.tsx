import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/core/react-query";
import { ProfilePage } from "@/app/[...slugs]/_profile-page";
import { CommunityPage } from "@/app/[...slugs]/_community-page";
import { Feedback, Navbar, ScrollToTop, Theme } from "@/features/shared";

interface Props {
  params: { slugs: string[] };
  searchParams: Record<string, string | undefined>;
}

export default function FilteredOrCategorizedPage({ params: { slugs }, searchParams }: Props) {
  const filterOrUsername = slugs[0];
  const communityNameOrAccountFilters = slugs[1];
  const isProfile = filterOrUsername.startsWith("@") || filterOrUsername.startsWith("%40");

  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <ScrollToTop />
      <Theme />
      <Feedback />
      <Navbar />
      {isProfile && (
        <ProfilePage
          username={filterOrUsername.replace("%40", "")}
          section={communityNameOrAccountFilters}
          searchParams={searchParams}
        />
      )}
      {!isProfile && (
        <CommunityPage
          searchParams={searchParams}
          params={{
            filterOrCategory: filterOrUsername,
            entryOrCommunity: communityNameOrAccountFilters
          }}
        />
      )}
    </HydrationBoundary>
  );
}
