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
import { decks as initialDeckItems } from "./decks.data";
import { HotListItem, SearchListItem } from "../deck/deck-items";
import { hotListItems, searchListItems } from "../deck/mockData";

const DeckViewContainer = ({ global, toggleListStyle }: any) => {
  const [openModal, setOpenModal] = useState(false);
  const [decks, setDecks] = useState<any>(initialDeckItems);
  const onSelectColumn = (account:string,contentType:string) => {
    setOpenModal(false)
    setDecks([...decks, 
      {
        data: account==="Trending topics" ? hotListItems : searchListItems,
        listItemComponent: account==="Trending topics" ? HotListItem : SearchListItem,
        header: { title: `${contentType} for ${account}`, icon: notifications },
      }].reverse())
  }
  return (
    <>
    <DeckAddModal open={openModal} onClose={()=>setOpenModal(false)} onSelect={onSelectColumn} />
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
        <DraggableDeckView decks={decks} />
      </div>
    </div>
    </>
  );
};

export const DeckView = connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(DeckViewContainer);
