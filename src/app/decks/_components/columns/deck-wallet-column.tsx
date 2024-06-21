import React, { useContext, useEffect, useMemo, useState } from "react";
import { UserDeckGridItem } from "../types";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { GenericDeckWithDataColumn } from "./generic-deck-with-data-column";
import { ShortListItemSkeleton } from "./deck-items";
import { DeckGridContext } from "../deck-manager";
import { DeckContentTypeColumnSettings } from "./deck-column-settings/deck-content-type-column-settings";
import { WALLET_CONTENT_TYPES } from "../consts";
import { Transaction } from "@/entities";
import { getDynamicPropsQuery, getTransactionsQuery } from "@/api/queries";
import i18next from "i18next";
import { TransactionRow } from "@/features/shared";

interface Props {
  id: string;
  settings: UserDeckGridItem["settings"];
  draggable?: DraggableProvidedDragHandleProps | null;
}

type IdentifiableTransaction = Transaction & { id: string };

export const DeckWalletColumn = ({ id, settings, draggable }: Props) => {
  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();
  const { data, isRefetching, refetch } = getTransactionsQuery(
    settings.username,
    20,
    settings.contentType as any
  ).useClientQuery();

  const [isFirstLoaded, setIsFirstLoaded] = useState(false);

  const dataFlow = useMemo(
    () => data?.pages?.reduce((acc, page) => [...acc, ...page], []) ?? [],
    [data]
  ) as IdentifiableTransaction[];

  const { updateColumnIntervalMs } = useContext(DeckGridContext);

  useEffect(() => {
    if ((data?.pages.length ?? 0) > 0) {
      setIsFirstLoaded(true);
    }
  }, [data]);

  return (
    <GenericDeckWithDataColumn
      id={id}
      draggable={draggable}
      header={{
        title: "@" + settings.username.toLowerCase(),
        subtitle: i18next.t("decks.wallet"),
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v),
        additionalSettings: (
          <DeckContentTypeColumnSettings
            title={i18next.t("decks.columns.filters")}
            contentTypes={WALLET_CONTENT_TYPES}
            settings={settings}
            id={id}
          />
        )
      }}
      data={dataFlow}
      isReloading={isRefetching}
      isFirstLoaded={isFirstLoaded}
      onReload={() => refetch()}
      skeletonItem={<ShortListItemSkeleton />}
    >
      {(item: Transaction, measure: any, index: number) => (
        <TransactionRow transaction={item} onMounted={measure} />
      )}
    </GenericDeckWithDataColumn>
  );
};
