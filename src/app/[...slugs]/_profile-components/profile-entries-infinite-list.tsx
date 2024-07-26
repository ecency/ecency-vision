"use client";

import { DetectBottom, EntryListContent } from "@/features/shared";
import React, { useMemo } from "react";
import { usePostsFeedQuery } from "@/api/queries";
import { Entry, FullAccount } from "@/entities";

interface Props {
  account: FullAccount;
  section: string;
}

export function ProfileEntriesInfiniteList({ section, account }: Props) {
  const { fetchNextPage, data } = usePostsFeedQuery(section, `@${account.name}`);

  const entryList = useMemo(
    () =>
      // Drop first page as it has loaded in a server and shown in RSC
      data?.pages
        ?.slice(1)
        ?.reduce<Entry[]>((acc, page) => [...acc, ...(page as Entry[])], [])
        ?.filter((item: Entry) => item.permlink !== account.profile?.pinned) ?? [],
    [account.profile?.pinned, data?.pages]
  );

  return (
    <>
      <EntryListContent
        username={`@${account.name}`}
        loading={false}
        entries={entryList}
        sectionParam={section}
        isPromoted={false}
      />
      <DetectBottom onBottom={() => fetchNextPage()} />
    </>
  );
}
