import React, { useState } from "react";
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
import {
  pageMapDispatchToProps,
  pageMapStateToProps,
} from "../../pages/common";
import { DeckAddModal } from "../deck-add-modal";
import ListStyleToggle from "../list-style-toggle";
import { DraggableDeckView } from "./draggable-deck-view";

const DeckViewContainer = ({ global, toggleListStyle }: any) => {
  const [openModal, setOpenModal] = useState(false)
  return (
    <>
    <DeckAddModal open={openModal} onClose={()=>setOpenModal(false)}/>
    <div className="d-flex flex-grow-1">
      <div className="navbar d-flex flex-column align-items-center pt-5 p-3">
        <div className="mt-5 my-icons-5 cursor-pointer">
          <ListStyleToggle
            global={global}
            toggleListStyle={toggleListStyle}
            iconClass="menu-icon"
            float="left"
          />
        </div>
        <div className="cursor-pointer">{person}</div>
        <div className="my-icons-5 cursor-pointer">{hot}</div>
        <div className="cursor-pointer">{magnify}</div>
        <div className="my-icons-5 cursor-pointer">{communities}</div>
        <div className="cursor-pointer">{tags}</div>
        <div className="my-icons-5 cursor-pointer">{notifications}</div>
        <div className="cursor-pointer">{wallet}</div>
        <div className="my-icons-5 cursor-pointer" onClick={()=>setOpenModal(true)}>{plusEncircled}</div>
      </div>
      <div className="decks-container d-flex p-5 mt-5 overflow-auto flex-grow-1">
        <DraggableDeckView />
      </div>
    </div>
    </>
  );
};

export const DeckView = connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(DeckViewContainer);
