import React, { useContext, useEffect, useState } from "react";
import { UserDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { GenericDeckColumn } from "./generic-deck-column";
import { fetchTransactions } from "../../../store/transactions/fetchTransactions";
import { TransactionRow } from "../../transactions";
import { Transaction } from "../../../store/transactions/types";
import { useMappedStore } from "../../../store/use-mapped-store";
import { History } from "history";
import { ShortListItemSkeleton } from "./deck-items";
import { DeckGridContext } from "../deck-manager";

interface Props {
  id: string;
  history: History;
  settings: UserDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps;
}

type IdentifiableTransaction = Transaction & { id: string };

export const DeckWalletColumn = ({ id, settings, draggable, history }: Props) => {
  const { dynamicProps, global } = useMappedStore();

  const [data, setData] = useState<IdentifiableTransaction[]>([]);
  const [isReloading, setIsReloading] = useState(false);

  const { updateColumnIntervalMs } = useContext(DeckGridContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (data.length) {
      setIsReloading(true);
    }

    try {
      const response = await fetchTransactions(settings.username, settings.contentType as any);
      setData(response.map((item) => ({ ...item, id: item.trx_id })) ?? []);
    } catch (e) {
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <GenericDeckColumn
      id={id}
      draggable={draggable}
      header={{
        title: "@" + settings.username.toLowerCase(),
        subtitle: "Wallet",
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v)
      }}
      data={data}
      isReloading={isReloading}
      onReload={() => fetchData()}
      skeletonItem={<ShortListItemSkeleton />}
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
