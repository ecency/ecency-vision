import React from "react";
import { Spinner } from "react-bootstrap";

export const DeckLoader = () => {
  return (
    <div className="deck-loader">
      <Spinner animation="border" />
      <div>Loading decks...</div>
    </div>
  );
};
