"use client";

import { ChangeEvent, useMemo, useState } from "react";
import "./_index.scss";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { TransactionRow } from "@/features/shared/transactions/transaction-row";
import i18next from "i18next";
import { LinearProgress } from "@/features/shared";
import { OperationGroup } from "@/consts";
import { getTransactionsQuery } from "@/api/queries";
import { Account } from "@/entities";

interface Props {
  account: Account;
  fetchTransactions: (
    username: string,
    group?: OperationGroup | "",
    start?: number,
    limit?: number
  ) => void;
}

export const TransactionsList = ({ account }: Props) => {
  const [group, setGroup] = useState<OperationGroup>();
  const [loadingLoadMore, setLoadingLoadMore] = useState(false);

  const {
    data: transactionsList,
    isLoading,
    fetchNextPage
  } = getTransactionsQuery(account.name, 20, group).useClientQuery();
  const transactionsFlow = useMemo(
    () => transactionsList?.pages?.reduce((acc, page) => [...acc, ...page], []) ?? [],
    []
  );
  const uniqueTransactionsList = useMemo(
    () => Array.from(new Map(transactionsFlow.map((item) => [item["num"], item])).values()),
    [transactionsFlow]
  );

  const loadMore = () => fetchNextPage();

  return (
    <div className="transaction-list">
      <div className="transaction-list-header">
        <h2>{i18next.t("transactions.title")} </h2>
        <FormControl
          type="select"
          value={group}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setGroup(e.target.value as OperationGroup)
          }
        >
          <option value="">{i18next.t("transactions.group-all")}</option>
          {["transfers", "market-orders", "interests", "stake-operations", "rewards"].map((x) => (
            <option key={x} value={x}>
              {i18next.t(`transactions.group-${x}`)}
            </option>
          ))}
        </FormControl>
      </div>
      {isLoading && <LinearProgress />}
      {uniqueTransactionsList.map((x, k) => (
        <TransactionRow key={k} transaction={x} />
      ))}
      {!isLoading && uniqueTransactionsList.length === 0 && (
        <p className="text-gray-600 empty-list">{i18next.t("g.empty-list")}</p>
      )}
      {!isLoading && uniqueTransactionsList.length > 0 && (
        <Button disabled={loadingLoadMore} onClick={loadMore} className="w-full mt-2">
          {i18next.t("g.load-more")}
        </Button>
      )}
    </div>
  );
};

export * from "./transaction-row";
