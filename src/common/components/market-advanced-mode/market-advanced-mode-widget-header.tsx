import {
  chevronDownSvgForSlider,
  chevronUpSvgForSlider,
  deleteForeverSvg,
  hot,
  refreshSvg
} from "../../img/svg";
import { Button, Card, OverlayTrigger } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import { DeckHeaderSettings } from "../deck/deck-header-settings";
import { _t } from "../../i18n";
import React, { useState } from "react";

interface Props {
  title: string;
}

export const MarketAdvancedModeWidgetHeader = ({ title }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Accordion className={expanded ? "border-bottom" : ""}>
      <div className="d-flex flex-column border-bottom">
        <div className="d-flex justify-content-between align-items-center deck-header position-relative">
          <div className="d-flex align-items-center">
            <div className="deck-index" />
            <div className="d-flex align-items-center ml-3">
              <div className="icon mr-2">{hot}</div>
              <div className="header-title">{title}</div>
            </div>
          </div>
          <Accordion.Toggle as={Button} variant="link" eventKey="0" className="p-0">
            <div className={`pointer`} onClick={() => setExpanded(!expanded)}>
              <span>{expanded ? chevronUpSvgForSlider : chevronDownSvgForSlider}</span>
            </div>
          </Accordion.Toggle>
        </div>
      </div>
      <Accordion.Collapse eventKey="0">
        <Card.Body className="p-0"></Card.Body>
      </Accordion.Collapse>
    </Accordion>
  );
};
