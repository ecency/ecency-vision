import React from "react";
import { Button } from "react-bootstrap";
import { pencilOutlineSvg } from "../../../img/svg";
import { _t } from "../../../i18n";

interface Props {
  isExpanded: boolean;
}

export const DeckToolbarCreate = ({ isExpanded }: Props) => {
  return (
    <div className="deck-toolbar-create">
      <Button href="/submit">
        {pencilOutlineSvg}
        {isExpanded ? _t("decks.create") : ""}
      </Button>
    </div>
  );
};
