import React from "react";
import { burgerGrey, hot } from "../../img/svg";
import { ListStyle } from "../../store/global/types";

export interface DeckHeaderProps {
  title: string;
  icon: any;
  index: number;
  setOptions: (option: null | string) => void;
  options: null | string;
}

const DeckHeader = ({ title, icon, index, setOptions, options }: DeckHeaderProps) => {
  return (
    <div className="border-bottom d-flex justify-content-between align-items-center deck-header position-relative">
      <div className="d-flex align-items-center">
        <div className="index">{index}</div>
        <div className="d-flex align-items-center ml-3">
          <div className="icon mr-2">{icon || hot}</div>
          <div className="header-title">{title}</div>
        </div>
      </div>
      <div className={`${options ? "disabled muted" : "pointer"}`} onClick={() => !options && setOptions(title)}>{burgerGrey}</div>
    </div>
  );
};

export interface DeckProps {
  header: { title: string; icon: any };
  listItemComponent: any;
  index: number;
  data: any[];
  options: null | string;
  setOptions: (option: null | string) => void;
  extras: any;
  toggleListStyle: (listStyle: ListStyle) => void;
}

export const Deck = ({
  header,
  listItemComponent: ListItem,
  toggleListStyle,
  index,
  data,
  extras,
  options,
  setOptions,
  ...rest
}: DeckProps) => {
  return (
    <div className={"deck mr-3 rounded-top"}>
      <DeckHeader {...header} index={index} options={options} setOptions={setOptions} />
      <div
        className={
          `py-4 pr-4 pl-3 item-container ${header.title.includes("Wallet")
          ? "transaction-list"
          : ""}`
        }
      >
        {data &&
          data.map((item, index) => (
            <ListItem
              toggleListStyle={toggleListStyle}
              index={index + 1}
              key={`${item.title}-${index}`}
              entry={item}
              {...item}
              {...rest}
            />
          ))}
      </div>
    </div>
  );
};
