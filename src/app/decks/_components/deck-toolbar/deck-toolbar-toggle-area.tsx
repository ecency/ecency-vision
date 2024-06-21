import React from "react";
import { arrowLeftSvg, arrowRightSvg } from "@ui/svg";

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
