import React from "react";
import { _t } from "../../i18n";
import { ListStyle } from "../../store/global/types";
import { DeckHeader } from "./deck-header";
import "./_index.scss";

export interface DeckProps {
  header: { title: string; icon: any; updateIntervalMs: number };
  listItemComponent: any;
  index: number;
  data: any[];
  onRemove: (option: string) => void;
  onReloadColumn: (option: string) => void;
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
  onRemove,
  onReloadColumn,
  ...rest
}: DeckProps) => {
  const notificationTranslated = _t("decks.notifications");
  const containerClass = header.title.includes(notificationTranslated) ? "list-body pb-0" : "";

  return (
    <div className={`deck mr-3 rounded-top ${containerClass}`}>
      <DeckHeader
        account={(rest as any).activeUser ? (rest as any).activeUser.username : ""}
        {...header}
        index={index}
        onRemove={onRemove}
        onReloadColumn={onReloadColumn}
      />
      <div
        className={`p-3 item-container ${
          header.title.includes("Wallet") ? "transaction-list" : ""
        }`}
        // ref={deckItemRef}
        // onScroll={(e) => {
        //   let scrollTopValue = deckItemRef!.current!.scrollTop;
        //   let scrollHeight = deckItemRef!.current!.scrollHeight;
        //   if (scrollHeight - scrollTopValue < 750) {
        //     success("It's near end");
        //   }
        // }}
      >
        {data &&
          data.map((item, index) => (
            <ListItem
              toggleListStyle={toggleListStyle}
              index={index + 1}
              key={`${item.title}-${index}`}
              entry={{ ...item, toggleNotNeeded: true }}
              {...item}
              {...rest}
            />
          ))}
      </div>
    </div>
  );
};
