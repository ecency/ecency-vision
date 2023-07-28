import React from "react";
import { _t } from "../../i18n";
import { Spinner } from "../spinner";

export const DeckLoader = () => {
  return (
    <div className="deck-loader">
      <Spinner className="w-8 h-8" />
      <div>{_t("decks.loading")}</div>
    </div>
  );
};
