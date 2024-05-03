import React, { useState } from "react";
import { chevronDownSvgForSlider, chevronUpSvgForSlider } from "../../../img/svg";
import { Button } from "@ui/button";
import { Accordion, AccordionCollapse, AccordionToggle } from "@ui/accordion";

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
      <AccordionToggle
        as={Button}
        size="sm"
        eventKey="0"
        appearance="link"
        className="justify-between w-full toggle"
        onClick={() => setExpanded(!expanded)}
        icon={expanded ? chevronUpSvgForSlider : chevronDownSvgForSlider}
      >
        {title}
      </AccordionToggle>
      <AccordionCollapse eventKey="0">
        <div className="flex justify-end p-2">{children}</div>
      </AccordionCollapse>
    </Accordion>
  );
};
