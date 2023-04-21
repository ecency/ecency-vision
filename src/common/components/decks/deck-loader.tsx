import React from "react";
import { Spinner } from "react-bootstrap";
import { _t } from "../../i18n";

export const DeckLoader = () => {
  return (
    <div className="deck-loader">
      <Spinner animation="border" />
      <div>{_t("decks.loading")}</div>
    </div>
  );
};
