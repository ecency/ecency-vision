import React from "react";
import { Button } from "react-bootstrap";
import { pencilOutlineSvg } from "../../../img/svg";

interface Props {
  isExpanded: boolean;
}

export const DeckToolbarCreate = ({ isExpanded }: Props) => {
  return (
    <div className="deck-toolbar-create">
      <Button href="/submit">
        {pencilOutlineSvg}
        {isExpanded ? "Create" : ""}
      </Button>
    </div>
  );
};
