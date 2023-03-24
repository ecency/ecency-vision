import React, { useEffect, useState } from "react";
import { UserDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { GenericDeckColumn } from "./generic-deck-column";
import { fetchTransactions } from "../../../store/transactions/fetchTransactions";
import { TransactionRow } from "../../transactions";
import { Transaction } from "../../../store/transactions/types";
import { useMappedStore } from "../../../store/use-mapped-store";
import { History } from "history";
import { ListItemSkeleton, WalletListItemSkeleton } from "./deck-items";

interface Props {
  history: History;
  settings: UserDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckWalletColumn = ({ settings, draggable, history }: Props) => {
  const { dynamicProps, global } = useMappedStore();

  const [data, setData] = useState<Transaction[]>([]);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (data.length) {
      setIsReloading(true);
    }

    try {
      const response = await fetchTransactions(settings.username, settings.contentType as any);
      setData(response ?? []);
    } catch (e) {
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <GenericDeckColumn
      draggable={draggable}
      header={{
        title: "@" + settings.username.toLowerCase(),
        subtitle: "Wallet",
        icon: null,
        updateIntervalMs: settings.updateIntervalMs
      }}
      data={data}
      isReloading={isReloading}
      onReload={() => fetchData()}
      onRemove={() => {}}
      skeletonItem={<WalletListItemSkeleton />}
    >
      {(item: Transaction, measure: any, index: number) => (
        <TransactionRow
          global={global}
          history={history}
          dynamicProps={dynamicProps}
          transaction={item}
          onMounted={measure}
        />
      )}
    </GenericDeckColumn>
  );
};
