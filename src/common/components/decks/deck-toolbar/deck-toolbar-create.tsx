import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { pencilOutlineSvg } from "../../../img/svg";
import { _t } from "../../../i18n";
import { DeckThreadsFormContext } from "../deck-threads-form";

interface Props {
  isExpanded: boolean;
}

export const DeckToolbarCreate = ({ isExpanded }: Props) => {
  const { setShow, show } = useContext(DeckThreadsFormContext);

  return (
    <div className="deck-toolbar-create">
      <Button onClick={() => setShow(!show)}>
        {pencilOutlineSvg}
        {isExpanded ? _t("decks.wave") : ""}
      </Button>
    </div>
  );
};
