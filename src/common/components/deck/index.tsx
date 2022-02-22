import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import {
  chevronDownSvgForSlider,
  chevronUpSvg,
  chevronUpSvgForSlider,
  deleteForeverSvg,
  hot,
  refreshSvg,
} from "../../img/svg";
import { ListStyle } from "../../store/global/types";

export interface DeckHeaderProps {
  title: string;
  icon: any;
  index: number;
  onRemove: (option: string) => void;
}

const DeckHeader = ({ title, icon, index, onRemove }: DeckHeaderProps) => {
  const [expanded, setExpanded] = useState(false);
  let splittedTitle = title.split("@");
  let onlyTitle = splittedTitle[0];
  let username = splittedTitle[1];

  return (
    <Accordion className={expanded ? "border-bottom" : ""}>
      <div className="d-flex flex-column border-bottom">
        <div className="d-flex justify-content-between align-items-center deck-header position-relative">
          <div className="d-flex align-items-center">
            <div className="index">{index}</div>
            <div className="d-flex align-items-center ml-3">
              <div className="icon mr-2">{icon || hot}</div>
              <div className="header-title">{onlyTitle}</div>
              {username && (
                <div className="ml-1">
                  <small className="text-lowercase text-secondary">@{username.toLowerCase()}</small>
                </div>
              )}
            </div>
          </div>
          <Accordion.Toggle as={Button} variant="link" eventKey="0" className="p-0">
            <div
              className={`pointer`}
              onClick={() => {
                setExpanded(!expanded);
              }}
            >
              {expanded ? chevronUpSvgForSlider : chevronDownSvgForSlider}
            </div>
          </Accordion.Toggle>
        </div>
      </div>
      <Accordion.Collapse eventKey="0">
        <Card.Body className="p-0 d-flex justify-content-end p-3">
          <Button size="sm" className="d-flex align-items-center">
            <div className="deck-options-icon mr-2">{refreshSvg}</div>
            <div>Reload</div>
          </Button>
          <Button
            size="sm"
            className="d-flex align-items-center ml-3"
            variant="danger"
            onClick={() => onRemove(title)}
          >
            <div className="deck-options-icon mr-2">{deleteForeverSvg}</div>
            <div>Remove</div>
          </Button>
        </Card.Body>
      </Accordion.Collapse>
    </Accordion>
  );
};

export interface DeckProps {
  header: { title: string; icon: any };
  listItemComponent: any;
  index: number;
  data: any[];
  onRemove: (option: string) => void;
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
  ...rest
}: DeckProps) => {
  return (
    <div className={"deck mr-3 rounded-top"}>
      <DeckHeader {...header} index={index} onRemove={onRemove} />
      <div
        className={`py-4 pr-4 pl-3 item-container ${
          header.title.includes("Wallet") ? "transaction-list" : ""
        }`}
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
