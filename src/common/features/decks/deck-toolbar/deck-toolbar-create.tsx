import React, { useContext } from "react";
import { pencilOutlineSvg } from "../../../img/svg";
import { _t } from "../../../i18n";
import { DeckThreadsFormContext } from "../deck-threads-form";
import { Button } from "@ui/button";

interface Props {
  isExpanded: boolean;
}

export const DeckToolbarCreate = ({ isExpanded }: Props) => {
  const { setShow, show } = useContext(DeckThreadsFormContext);

  return (
    <div className="deck-toolbar-create">
      <Button icon={pencilOutlineSvg} iconPlacement="left" onClick={() => setShow(!show)}>
        {isExpanded ? _t("decks.wave") : ""}
      </Button>
    </div>
  );
};
