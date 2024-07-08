import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/core/react-query";
import { ProfilePage } from "@/app/[...slugs]/_profile-page";
import { CommunityPage } from "@/app/[...slugs]/_community-page";
import { Feedback, Navbar, ScrollToTop, Theme } from "@/features/shared";
import { EntryFilter } from "@/enums";
import { EntryIndex } from "@/app/[...slugs]/_index";

interface Props {
  params: { slugs: string[] };
  searchParams: Record<string, string | undefined>;
}

export default function FilteredOrCategorizedPage({ params: { slugs }, searchParams }: Props) {
  const filterOrUsername = slugs[0];
  const communityNameOrAccountFilters = slugs[1];
  const isProfile = filterOrUsername.startsWith("@") || filterOrUsername.startsWith("%40");

  const isIndexPage = Object.values<string>(EntryFilter).includes(slugs[0]) && slugs.length > 0;

  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <ScrollToTop />
      <Theme />
      <Feedback />
      <Navbar />
      {isIndexPage && <EntryIndex />}
      {isProfile && !isIndexPage && (
        <ProfilePage
          username={filterOrUsername.replace("%40", "")}
          section={communityNameOrAccountFilters}
          searchParams={searchParams}
        />
      )}
      {!isProfile && !isIndexPage && (
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
