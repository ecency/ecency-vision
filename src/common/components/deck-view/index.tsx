import React from "react";
import { connect } from "react-redux";
import {
  communities,
  hot,
  magnify,
  notifications,
  person,
  plusEncircled,
  tags,
  wallet,
} from "../../img/svg";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../../pages/common";
import { Deck } from "../deck";
import ListStyleToggle from "../list-style-toggle";

const DeckViewContainer = ({global, toggleListStyle}:PageProps) => {
  return (
    <div className="d-flex flex-grow-1">
      <div className="navbar d-flex flex-column align-items-center pt-5 p-3">
        <div className="mt-5 my-icons-5 cursor-pointer">
            <ListStyleToggle global={global} toggleListStyle={toggleListStyle} iconClass="menu-icon"/>
        </div>
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

export const DeckView = connect(pageMapStateToProps, pageMapDispatchToProps)(DeckViewContainer);
