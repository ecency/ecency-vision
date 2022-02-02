import React from "react";
import {
  burger,
  communities,
  grid,
  hot,
  magnify,
  notifications,
  person,
  plusEncircled,
  tags,
  wallet,
} from "../../img/svg";
import { Deck } from "../deck";

export const DeckView = () => {
  return (
    <div className="d-flex flex-grow-1">
      <div className="navbar d-flex flex-column align-items-center pt-5 p-3">
        <div className="pt-5 cursor-pointer">{burger}</div>
        <div className="my-icons-5 cursor-pointer">{grid}</div>
        <div className="cursor-pointer">{person}</div>
        <div className="my-icons-5 cursor-pointer">{hot}</div>
        <div className="cursor-pointer">{magnify}</div>
        <div className="my-icons-5 cursor-pointer">{communities}</div>
        <div className="cursor-pointer">{tags}</div>
        <div className="my-icons-5 cursor-pointer">{notifications}</div>
        <div className="cursor-pointer">{wallet}</div>
        <div className="my-icons-5 cursor-pointer">{plusEncircled}</div>
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
