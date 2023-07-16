import React, { useState } from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import { chevronDownSvgForSlider, chevronUpSvgForSlider } from "../../../img/svg";

interface Props {
  title: string;
  children: any;
  hasBorderBottom: boolean;
  className?: string;
}

export const DeckHeaderSettingsItem = ({ title, children, hasBorderBottom, className }: Props) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Accordion
      className={
        "deck-header-settings-item " +
        (hasBorderBottom ? "border-b border-[--border-color] " : "") +
        className
      }
    >
      <Accordion.Toggle
        as={Button}
        variant="link"
        eventKey="0"
        className="d-flex justify-content-between w-100 toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {title}
        <span className="text-secondary">
          {expanded ? chevronUpSvgForSlider : chevronDownSvgForSlider}
        </span>
      </Accordion.Toggle>
      <Accordion.Collapse eventKey="0">
        <Card.Body className="p-0 d-flex justify-content-end p-2">{children}</Card.Body>
      </Accordion.Collapse>
    </Accordion>
  );
};
