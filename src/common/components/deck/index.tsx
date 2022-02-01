import React from "react";
import { hot } from "../../img/svg";

const DeckHeader = () => {
  return (
    <div className="border-bottom p-3 d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center">
        <div>2</div>
        <div className="d-flex align-items-center">
          <div>{hot}</div>
          <div>title</div>
        </div>
      </div>
    </div>
  );
};

export const Deck = () => {
  return (
    <div className="deck mr-5">
      <DeckHeader />
    </div>
  );
};
