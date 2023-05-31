import React, { useContext, useEffect, useState } from "react";
import { UserDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { GenericDeckWithDataColumn } from "./generic-deck-with-data-column";
import { fetchTransactions } from "../../../store/transactions/fetchTransactions";
import { TransactionRow } from "../../transactions";
import { Transaction } from "../../../store/transactions/types";
import { useMappedStore } from "../../../store/use-mapped-store";
import { History } from "history";
import { ShortListItemSkeleton } from "./deck-items";
import { DeckGridContext } from "../deck-manager";
import usePrevious from "react-use/lib/usePrevious";
import { DeckContentTypeColumnSettings } from "./deck-column-settings/deck-content-type-column-settings";
import { WALLET_CONTENT_TYPES } from "../consts";
import { _t } from "../../../i18n";

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
  const [isFirstLoaded, setIsFirstLoaded] = useState(false);

  const { updateColumnIntervalMs } = useContext(DeckGridContext);
  const prevSettings = usePrevious(settings);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (prevSettings && prevSettings?.contentType !== settings.contentType) {
      setData([]);
      fetchData();
    }
  }, [settings.contentType]);

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
      setIsFirstLoaded(true);
    }
  };

  return (
    <GenericDeckWithDataColumn
      id={id}
      draggable={draggable}
      header={{
        title: "@" + settings.username.toLowerCase(),
        subtitle: "Wallet",
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v),
        additionalSettings: (
          <DeckContentTypeColumnSettings
            title={_t("decks.columns.filters")}
            contentTypes={WALLET_CONTENT_TYPES}
            settings={settings}
            id={id}
          />
        )
      }}
      data={data}
      isReloading={isReloading}
      isFirstLoaded={isFirstLoaded}
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
    </GenericDeckWithDataColumn>
  );
};
