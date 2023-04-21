import { arrowLeftSvg, arrowRightSvg } from "../../../img/svg";
import React from "react";

interface Props {
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
}

export const DeckToolbarToggleArea = ({ isExpanded, setIsExpanded }: Props) => {
  return (
    <div className="deck-toolbar-toggle" onClick={() => setIsExpanded(!isExpanded)}>
      {isExpanded ? arrowLeftSvg : arrowRightSvg}
    </div>
  );
};
