import { CommunitySubscribers } from "@/app/[...slugs]/_components/community-subscribers";
import { CommunityActivities } from "@/app/[...slugs]/_components/community-activities";
import { CommunityRoles } from "@/app/[...slugs]/_components/community-roles";
import { EntryListContent, LinearProgress } from "@/features/shared";
import { Fragment } from "react";
import { Community, Entry } from "@/entities";
import { getPostsFeedQueryData } from "@/api/queries/get-account-posts-feed-query";
import { CommunityContentSearch } from "@/app/[...slugs]/_components/community-content-search";
import { ProfileEntriesLayout } from "@/app/[...slugs]/_profile-components/profile-entries-layout";
import { CommunityContentSearchData } from "@/app/[...slugs]/_components/community-content-search-data";
import { CommunityContentInfiniteList } from "@/app/[...slugs]/_components/community-content-infinite-list";

interface Props {
  filter: string;
  tag: string;
  community: Community;
  query?: string;
  section: string;
}

export async function CommunityContent({ filter, community, tag, query, section }: Props) {
  if (filter === "subscribers") {
    return <CommunitySubscribers community={community} />;
  }

  if (filter === "activities") {
    return <CommunityActivities community={community} />;
  }

  if (filter === "roles") {
    return <CommunityRoles community={community} />;
  }

  const data = getPostsFeedQueryData(filter, tag);

  if (!data || !data.pages || data.pages.length === 0) {
    return <></>;
  }

  return (
    <>
      {data.pages.length === 0 ? <LinearProgress /> : ""}

      {["hot", "created", "trending"].includes(filter) && data.pages.length > 0 && (
        <div className="searchProfile">
          <CommunityContentSearch community={community} filter={filter} />
        </div>
      )}
      <CommunityContentSearchData query={query} community={community} />

      {(!query || query?.length === 0) && (
        <ProfileEntriesLayout section={section} username={community.name}>
          <EntryListContent
            username={community.name}
            isPromoted={filter === "promoted"}
            entries={data.pages.reduce<Entry[]>((acc, page) => [...acc, ...(page as Entry[])], [])}
            loading={false}
            sectionParam={section}
          />
          <CommunityContentInfiniteList community={community} section={section} />
        </ProfileEntriesLayout>
      )}
    </>
  );
}
