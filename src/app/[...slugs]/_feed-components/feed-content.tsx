import { EntryListContent } from "@/features/shared";
import React from "react";
import { FeedLayout } from "@/app/[...slugs]/_feed-components/feed-layout";
import { getPostsFeedQueryData } from "@/api/queries";
import { Entry } from "@/entities";
import { FeedInfiniteList } from "@/app/[...slugs]/_feed-components/feed-infinite-list";

interface Props {
  filter: string;
  tag: string;
}

export function FeedContent({ filter, tag }: Props) {
  const data = getPostsFeedQueryData(filter, tag);

  const entryList = data?.pages?.reduce<Entry[]>((acc, p) => [...acc, ...(p as Entry[])], []) ?? [];

  return (
    <FeedLayout tag={tag} filter={filter}>
      <EntryListContent
        loading={false}
        entries={entryList}
        sectionParam={filter}
        isPromoted={true}
        username=""
      />
      <FeedInfiniteList tag={tag} filter={filter} />
    </FeedLayout>
  );
}
