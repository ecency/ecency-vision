import React from "react";
import i18next from "i18next";

interface Props {
  data: any[];
  isEndReached: boolean;
  endReachedLabel?: string;
  failed?: boolean;
}

export const InfiniteScrollLoader = ({
  data,
  isEndReached,
  endReachedLabel = i18next.t("decks.columns.feed-end-reached"),
  failed
}: Props) => {
  return data.length > 0 ? (
    <div className="p-4 text-center text-gray-600">
      {failed
        ? i18next.t("decks.columns.infinite-failed")
        : isEndReached
          ? endReachedLabel
          : i18next.t("decks.columns.infinite-loading")}
    </div>
  ) : (
    <></>
  );
};
