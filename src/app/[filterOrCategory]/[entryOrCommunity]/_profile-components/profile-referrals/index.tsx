import React, { useMemo, useState } from "react";
import "./index.scss";
import { ProfileReferralsTable } from "@/app/[filterOrCategory]/[entryOrCommunity]/_profile-components/profile-referrals/profile-referrals-table";
import { Pagination } from "@/features/ui";
import { Account } from "@/entities";
import { ProfileReferralHeader } from "@/app/[filterOrCategory]/[entryOrCommunity]/_profile-components/profile-referrals/profile-referral-header";
import { LinearProgress } from "@/features/shared";
import { getReferralsQuery, getReferralsStatsQuery } from "@/api/queries";

interface Props {
  account: Account;
}

export function ProfileReferrals({ account }: Props) {
  const { data, fetchNextPage, isLoading } = getReferralsQuery(account.name).useClientQuery();
  const { data: stats } = getReferralsStatsQuery(account.name).useClientQuery();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const referrals = useMemo(
    () => data?.pages?.reduce((acc, item) => [...acc, ...item], []) ?? [],
    [data?.pages]
  );

  return (
    <div className="app-content witnesses-page mt-0 mx-0">
      <ProfileReferralHeader account={account} />
      {isLoading && <LinearProgress />}
      <div className="w-full overflow-x-auto">
        <ProfileReferralsTable account={account} page={page} pageSize={page} />

        {referrals.length >= pageSize && (
          <Pagination
            className="mt-4"
            dataLength={stats?.total ?? 0}
            pageSize={pageSize}
            maxItems={4}
            page={page}
            onPageChange={(page: number) => {
              setPage(page);
              fetchNextPage();
            }}
            showLastNo={false}
          />
        )}
      </div>
    </div>
  );
}
