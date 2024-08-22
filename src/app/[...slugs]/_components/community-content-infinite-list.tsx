"use client";

import { DetectBottom, EntryListContent } from "@/features/shared";
import React, { useMemo } from "react";
import { usePostsFeedQuery } from "@/api/queries";
import { Community, Entry } from "@/entities";

interface Props {
  community: Community;
  section: string;
}

export function CommunityContentInfiniteList({ section, community }: Props) {
  const { fetchNextPage, data } = usePostsFeedQuery(section, community.name);

  const entryList = useMemo(
    () =>
      // Drop first page as it has loaded in a server and shown in RSC
      data?.pages?.slice(1)?.reduce<Entry[]>((acc, page) => [...acc, ...(page as Entry[])], []) ??
      [],
    [data?.pages]
  );

  return (
    <>
      <EntryListContent
        username={community.name}
        loading={false}
        entries={entryList}
        sectionParam={section}
        isPromoted={false}
        showEmptyPlaceholder={false}
      />
      <DetectBottom onBottom={() => fetchNextPage()} />
    </>
  );
}
