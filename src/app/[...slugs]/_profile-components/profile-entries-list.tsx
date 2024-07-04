import { Entry, FullAccount } from "@/entities";
import { ListStyle } from "@/enums";
import { EntryListContent } from "@/features/shared";
import React from "react";
import { getPostQuery, getPostsFeedQueryData } from "@/api/queries";
import { useGlobalStore } from "@/core/global-store";
import { ProfileEntriesDetectBottom } from "@/app/[...slugs]/_profile-components/profile-entries-detect-bottom";

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
  const listStyle = useGlobalStore((s) => s.listStyle);

  const pinnedEntry = shouldShowPinnedEntry(account, section)
    ? await getPostQuery(account.name, account.profile?.pinned).prefetch()
    : undefined;

  const data = getPostsFeedQueryData(section, `@${account.name}`)?.pages ?? [];
  const entryList = data
    .reduce<Entry[]>((acc, page) => [...acc, ...(page as Entry[])], [])
    .filter((item: Entry) => item.permlink !== account.profile?.pinned);

  if (pinnedEntry) {
    entryList.unshift(pinnedEntry);
  }

  return (
    <>
      <div className={`entry-list`}>
        <div className={`entry-list-body ${listStyle === ListStyle.grid ? "grid-view" : ""}`}>
          {/*{entryList.length === 0 && <EntryListLoadingItem />}*/}
          <EntryListContent
            loading={false}
            entries={entryList}
            sectionParam={section}
            isPromoted={false}
          />
        </div>
      </div>
      <ProfileEntriesDetectBottom section={section} account={account} />
    </>
  );
}
