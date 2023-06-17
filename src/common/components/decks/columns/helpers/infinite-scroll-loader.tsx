import { _t } from "../../../../i18n";
import React from "react";

interface Props {
  data: any[];
  isEndReached: boolean;
  endReachedLabel?: string;
}

export const InfiniteScrollLoader = ({
  data,
  isEndReached,
  endReachedLabel = _t("decks.columns.feed-end-reached")
}: Props) => {
  return data.length > 0 ? (
    <div className="p-4 text-center text-secondary">
      {isEndReached ? endReachedLabel : _t("decks.columns.infinite-loading")}
    </div>
  ) : (
    <></>
  );
};
