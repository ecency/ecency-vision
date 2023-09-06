import React, { useState } from "react";
import { Accordion } from "react-bootstrap";
import { chevronDownSvgForSlider, chevronUpSvgForSlider } from "../../../img/svg";
import { Button } from "@ui/button";

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
        size="sm"
        eventKey="0"
        appearance="link"
        className="justify-between w-full toggle"
        onClick={() => setExpanded(!expanded)}
        icon={expanded ? chevronUpSvgForSlider : chevronDownSvgForSlider}
      >
        {title}
      </Accordion.Toggle>
      <Accordion.Collapse eventKey="0">
        <div className="d-flex justify-content-end p-2">{children}</div>
      </Accordion.Collapse>
    </Accordion>
  );
};
