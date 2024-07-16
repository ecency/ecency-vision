import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/core/react-query";
import { ProfilePage } from "@/app/[...slugs]/_profile-page";
import { CommunityPage } from "@/app/[...slugs]/_community-page";
import { Feedback, Navbar, ScrollToTop, Theme } from "@/features/shared";
import { EntryFilter } from "@/enums";
import { EntryIndex } from "@/app/[...slugs]/_index";
import { EntryPage } from "@/app/[...slugs]/_entry-page";
import { EntryEditPage } from "@/app/[...slugs]/_entry-edit-page";

interface Props {
  params: { slugs: string[] };
  searchParams: Record<string, string | undefined>;
}

export default function FilteredOrCategorizedPage({ params: { slugs }, searchParams }: Props) {
  const filterOrUsername = slugs[0];
  const communityNameOrAccountFilters = slugs[1];

  const isEntryPage = slugs.length > 2;
  const isIndexPage = Object.values<string>(EntryFilter).includes(slugs[0]) && slugs.length > 0;
  const isEditPage = isEntryPage && slugs[2] === "edit";
  const isProfilePage =
    filterOrUsername.startsWith("@") || (filterOrUsername.startsWith("%40") && !isEditPage);

  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <ScrollToTop />
      <Theme />
      <Feedback />
      <Navbar />
      {isIndexPage && !isProfilePage && !isEntryPage && <EntryIndex />}
      {isProfilePage && !isIndexPage && !isEntryPage && (
        <ProfilePage
          username={filterOrUsername.replace("%40", "")}
          section={communityNameOrAccountFilters}
          searchParams={searchParams}
        />
      )}
      {isEntryPage && !isEditPage && !isProfilePage && !isIndexPage && (
        <EntryPage
          category={slugs[0]}
          username={slugs[1].replace("%40", "").replace("@", "")}
          permlink={slugs[2]}
          isEdit={slugs[3] === "edit"}
          searchParams={searchParams}
        />
      )}
      {isEditPage && !isProfilePage && !isIndexPage && (
        <EntryEditPage
          username={slugs[0].replace("%40", "").replace("@", "")}
          permlink={slugs[1]}
        />
      )}
      {!isProfilePage && !isIndexPage && !isEntryPage && (
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
