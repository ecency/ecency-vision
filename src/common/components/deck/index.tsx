import React from "react";
import { burgerGrey, hot } from "../../img/svg";

const DeckHeader = () => {
  return (
    <div className="border-bottom d-flex justify-content-between align-items-center deck-header position-relative">
      <div className="d-flex align-items-center">
        <div className="index">2</div>
        <div className="d-flex align-items-center ml-3">
          <div className="icon">{hot}</div>
          <div className="header-title">Title</div>
        </div>
      </div>
      <div>
          {burgerGrey}
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
