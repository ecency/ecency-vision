import { Entry, FullAccount } from "@/entities";
import { EntryListContent } from "@/features/shared";
import React from "react";
import { getPostQuery, getPostsFeedQueryData } from "@/api/queries";
import { ProfileEntriesLayout } from "@/app/[...slugs]/_profile-components/profile-entries-layout";
import { ProfileEntriesInfiniteList } from "@/app/[...slugs]/_profile-components/profile-entries-infinite-list";

interface Props {
  section: string;
  account: FullAccount;
}

function shouldShowPinnedEntry(account: FullAccount, section: string) {
  return (
    !["blog", "posts"].includes(section) ||
    !((account as FullAccount)?.profile && (account as FullAccount)?.profile?.pinned) ||
    !((account as FullAccount)?.profile && (account as FullAccount)?.profile?.pinned !== "none")
  );
}

export async function ProfileEntriesList({ section, account }: Props) {
  const pinnedEntry = shouldShowPinnedEntry(account, section)
    ? await getPostQuery(account.name, account.profile?.pinned).prefetch()
    : undefined;

  const data = getPostsFeedQueryData(section, `@${account.name}`)?.pages ?? [];
  const entryList = (data[0] as Entry[]).filter(
    (item: Entry) => item.permlink !== account.profile?.pinned
  );

  if (pinnedEntry) {
    entryList.unshift(pinnedEntry);
  }

  return (
    <>
      <ProfileEntriesLayout section={section} username={account.name}>
        <EntryListContent
          username={`@${account.name}`}
          loading={false}
          entries={entryList}
          sectionParam={section}
          isPromoted={false}
        />
        <ProfileEntriesInfiniteList section={section} account={account} />
      </ProfileEntriesLayout>
    </>
  );
}
