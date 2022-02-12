import React from "react";
import { burgerGrey, hot } from "../../img/svg";
import { ListStyle } from "../../store/global/types";

export interface DeckHeaderProps { title: string; icon: any; index: number }

const DeckHeader = ({title, icon, index}:DeckHeaderProps) => {
  return (
    <div className="border-bottom d-flex justify-content-between align-items-center deck-header position-relative">
      <div className="d-flex align-items-center">
        <div className="index">{index}</div>
        <div className="d-flex align-items-center ml-3">
          <div className="icon mr-2">{icon || hot}</div>
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
  data: any[];
  toggleListStyle: (listStyle: ListStyle) => void
}

export const Deck = ({ header, listItemComponent: ListItem, toggleListStyle, index, data, ...rest }: DeckProps) => {
  return (
    <div className={"deck mr-5 rounded-top"} {...rest}>
      <DeckHeader {...header} index={index}/>
      <div className="py-4 pr-4 pl-3 item-container">
        {data && data.map((item, index) => (
          <ListItem toggleListStyle={toggleListStyle} index={index + 1} {...item} key={item.title} entry={item} {...rest}/>
        ))}
      </div>
    </div>
  );
};
