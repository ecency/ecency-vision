import { _t } from "../../../../i18n";
import React from "react";

interface Props {
  data: any[];
  isEndReached: boolean;
  endReachedLabel?: string;
  failed?: boolean;
}

export const InfiniteScrollLoader = ({
  data,
  isEndReached,
  endReachedLabel = _t("decks.columns.feed-end-reached"),
  failed
}: Props) => {
  return data.length > 0 ? (
    <div className="p-4 text-center text-gray-600">
      {failed
        ? _t("decks.columns.infinite-failed")
        : isEndReached
        ? endReachedLabel
        : _t("decks.columns.infinite-loading")}
    </div>
  ) : (
    <></>
  );
};
