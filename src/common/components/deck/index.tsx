import React from "react";
import { burgerGrey, hot } from "../../img/svg";
import { HotListItem } from "./deck-items";
import { hotListItems } from "./mockData";

export interface DeckHeaderProps { title: string; icon: any; index: number }

const DeckHeader = ({title, icon, index}:DeckHeaderProps) => {
  return (
    <div className="border-bottom d-flex justify-content-between align-items-center deck-header position-relative">
      <div className="d-flex align-items-center">
        <div className="index">{index}</div>
        <div className="d-flex align-items-center ml-3">
          <div className="icon">{icon || hot}</div>
          <div className="header-title">{title}</div>
        </div>
      </div>
      <div>{burgerGrey}</div>
    </div>
  );
};

export interface DeckProps {
  header: { title: string; icon: any };
  listItemComponent: any;
  index: number;
  data: any[]
}

export const Deck = ({ header, listItemComponent: ListItem, index, data }: DeckProps) => {

  return (
    <div className="deck mr-5 rounded-top">
      <DeckHeader {...header} index={index}/>
      <div className="py-4 pr-4 pl-3 item-container">
        {data.map((item, index) => (
          <ListItem index={index + 1} {...item} />
        ))}
      </div>
    </div>
  );
};
