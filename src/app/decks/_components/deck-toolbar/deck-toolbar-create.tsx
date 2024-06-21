import React, { useContext } from "react";
import { DeckThreadsFormContext } from "../deck-threads-form";
import { Button } from "@ui/button";
import { pencilOutlineSvg } from "@ui/svg";
import i18next from "i18next";

interface Props {
  isExpanded: boolean;
}

export const DeckToolbarCreate = ({ isExpanded }: Props) => {
  const { setShow, show } = useContext(DeckThreadsFormContext);

  return (
    <div className="deck-toolbar-create">
      <Button icon={pencilOutlineSvg} iconPlacement="left" onClick={() => setShow(!show)}>
        {isExpanded ? i18next.t("decks.wave") : ""}
      </Button>
    </div>
  );
};
