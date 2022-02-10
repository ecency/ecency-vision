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
import { SearchListItem } from "../deck/deck-items";

const DeckViewContainer = ({ global, toggleListStyle }: any) => {
  const [openModal, setOpenModal] = useState(false);
  const [decks, setDecks] = useState<any>(initialDeckItems);
  const onSelectColumn = (account:string,contentType:string) => {
    setOpenModal(false)
    setDecks([...decks, 
      {
        data: [
          {
            avatar: "https://mui.com/static/images/avatar/3.jpg",
            author: "loading",
            title: "Epic games store to offer 15 free games — here's how to get them",
            description: "Its been more than a month now since inception of GEMS community. We are thrilled to see the postive feedback from users and glad to see it contributing towards Hive ecosystem as a whole. In this short span of time, we have became the no. 1 community with highest count of Active Posters and Interactions than...",
            time:"1h",
            votesPayment:'$14',
            likes:'1.5k',
            comments:'1.9k',
            community:"in gaming",
            postImage:
              "https://cdn4.buysellads.net/uu/1/50798/1565723204-1548360785-Authentic2.jpg",
          },],
        listItemComponent: SearchListItem,
        header: { title: `${contentType} for ${account}`, icon: notifications },
      }].reverse())
  }
  return (
    <>
    <DeckAddModal open={openModal} onClose={()=>setOpenModal(false)} onSelect={onSelectColumn}/>
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
