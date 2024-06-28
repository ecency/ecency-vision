import React, { useMemo } from "react";
import {
  DetectBottom,
  EntryListContent,
  EntryListLoadingItem,
  LinearProgress
} from "@/features/shared";
import { ProfileCover } from "@/app/[filterOrCategory]/[entryOrCommunity]/_profile-components/profile-cover";
import { getAccountVoteHistoryQuery } from "@/api/queries";
import { utils } from "@hiveio/dhive";
import { Account, Entry } from "@/entities";

interface Props {
  section: string;
  account: Account;
}

const limit = 20;
const days = 7.0;

export function CurationTrail({ account, section }: Props) {
  const { data, isLoading, fetchNextPage } = getAccountVoteHistoryQuery(
    account.name,
    utils.makeBitMaskFilter([utils.operationOrders.vote])
  ).useClientQuery();

  const entries = useMemo(
    () => data?.pages?.reduce<Entry[]>((acc, page) => [...acc, ...page.entries], []) ?? [],
    [data?.pages]
  );
  const hasMore = useMemo(
    () => (data && data.pages ? data.pages[data.pages.length - 1]?.lastDate : 0) <= days,
    [data]
  );

  return (
    <>
      <ProfileCover account={account} />
      <EntryListContent
        loading={isLoading}
        isPromoted={false}
        sectionParam={section}
        entries={entries}
      />
      {isLoading && (
        <>
          <EntryListLoadingItem />
          <LinearProgress />
        </>
      )}
      <DetectBottom
        onBottom={() => {
          if (!isLoading && hasMore) {
            fetchNextPage();
          }
        }}
      />
    </>
  );
}
