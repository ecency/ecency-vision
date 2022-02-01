import React from "react";
import {
  burger,
  grid,
  hot,
  magnify,
  person,
  plusEncircled,
} from "../../img/svg";
import { Deck } from "../deck";

export const DeckView = () => {
  return (
    <div className="d-flex flex-grow-1">
      <div className="navbar d-flex flex-column align-items-center pt-5 p-3">
        <div className="pt-5 pointer">{burger}</div>
        <div className="my-4 pointer">{grid}</div>
        <div className="pointer">{magnify}</div>
        <div className="my-4 pointer">{hot}</div>
        <div className="pointer">{person}</div>
        <div className="my-4 pointer">{person}</div>
        <div>{plusEncircled}</div>
      </div>
      <div className="decks-container d-flex justify-content-between p-5 mt-5 overflow-auto">
          <Deck />
          <Deck />
          <Deck />
          <Deck />
          <Deck />
          <Deck />
          <Deck />
      </div>
    </div>
  );
};
