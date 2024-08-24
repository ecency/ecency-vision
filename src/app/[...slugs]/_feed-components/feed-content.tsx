import { EntryListContent } from "@/features/shared";
import React from "react";
import { FeedLayout } from "@/app/[...slugs]/_feed-components/feed-layout";
import { getPostsFeedQueryData } from "@/api/queries";
import { Entry } from "@/entities";
import { FeedInfiniteList } from "@/app/[...slugs]/_feed-components/feed-infinite-list";

interface Props {
  filter: string;
  tag: string;
  observer?: string;
}

export function FeedContent({ filter, tag, observer }: Props) {
  const data = getPostsFeedQueryData(filter, tag, 20, observer);

  const entryList =
    data?.pages?.reduce<Entry[]>((acc, p) => {
      if (p instanceof Array) {
        return [...acc, ...(p as Entry[])];
      }

      // @ts-ignore
      return [...acc, ...(p as { results: Entry[] }).results];
    }, []) ?? [];

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
