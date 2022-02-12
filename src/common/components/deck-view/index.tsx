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
import { DraggableDeckView, getItems } from "./draggable-deck-view";
import { decks as initialDeckItems } from "./decks.data";
import { HotListItem, SearchListItem } from "../deck/deck-items";
import { hotListItems, searchListItems } from "../deck/mockData";
import { getAccountPosts } from "../../api/bridge";

const DeckViewContainer = ({ global, toggleListStyle, ...rest }: any) => {
  const [openModal, setOpenModal] = useState(false);
  const [loadingNewContent, setLoadingNewContent] = useState(false);
  const [decks, setDecks] = useState<any>(getItems(initialDeckItems));

  const onSelectColumn = (account:string,contentType:string) => {
    setOpenModal(false);
    setLoadingNewContent(true);
    if(contentType){
      getAccountPosts(contentType, account).then(res=>{
        setDecks(getItems([...decks, 
          {
            data: res,
            listItemComponent: SearchListItem,
            header: { title: `${contentType} for ${account}`, icon: notifications },
          }]))
        setLoadingNewContent(false);
      })
    }
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
        <DraggableDeckView decks={decks} {...rest} global={global}/>
        {loadingNewContent && <div
                    className="spinner-border text-primary spinner-border-sm"
                    role="status"
                  >
                    <span className="sr-only">Loading...</span>
                  </div>}
      </div>
    </div>
    </>
  );
};

export const DeckView = connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(DeckViewContainer);
