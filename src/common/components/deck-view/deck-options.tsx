import React from "react";
import { closeSvg, deleteForeverSvg, refreshSvg } from "../../img/svg";

interface DeckOptionsProps {
  options: null | string;
  setOptions: (option: null) => void;
  onRemove: (deckToRemove: string) => void;
}

export const DeckOptions = ({
  setOptions,
  options,
  onRemove,
}: DeckOptionsProps) => {
  return (
    <div className="deck mr-3 rounded-top deck-options p-3">
      <div className="d-flex justify-content-end">
        <div
          className="deck-options-icon pointer"
          onClick={() => setOptions(null)}
        >
          {closeSvg}
        </div>
      </div>

      <div className="p-3 mt-3 d-flex align-items-center deck-option rounded">
        <div className="deck-options-icon mr-2">{refreshSvg}</div>
        <div>Reload</div>
      </div>

      <div
        className="p-3 mt-3 d-flex align-items-center deck-option rounded"
        onClick={() => onRemove(options as string)}
      >
        <div className="deck-options-icon mr-2">{deleteForeverSvg}</div>
        <div>Remove</div>
      </div>
    </div>
  );
};
