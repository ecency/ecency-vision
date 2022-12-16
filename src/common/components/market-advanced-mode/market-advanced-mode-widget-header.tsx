import { chevronDownSvgForSlider, chevronUpSvgForSlider, hot } from "../../img/svg";
import { Button, Card } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import React, { useState } from "react";

interface Props {
  title?: string;
  headerOptions?: JSX.Element;
  settings?: JSX.Element;
  icon?: JSX.Element;
}

export const MarketAdvancedModeWidgetHeader = ({ title, headerOptions, settings, icon }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Accordion className={expanded ? "border-bottom" : ""}>
      <div className="d-flex flex-column border-bottom">
        <div className="d-flex justify-content-between align-items-center deck-header position-relative">
          <div className="d-flex align-items-center w-100">
            <div className="deck-index" />
            {headerOptions}
            {title ? (
              <div className="d-flex align-items-center ml-3">
                {icon ? <div className="icon mr-2">{icon}</div> : <></>}
                <div className="header-title">{title}</div>
              </div>
            ) : (
              <></>
            )}
          </div>
          {settings ? (
            <Accordion.Toggle as={Button} variant="link" eventKey="0" className="p-0">
              <div className={`pointer`} onClick={() => setExpanded(!expanded)}>
                <span>{expanded ? chevronUpSvgForSlider : chevronDownSvgForSlider}</span>
              </div>
            </Accordion.Toggle>
          ) : (
            <></>
          )}
        </div>
      </div>
      {settings ? (
        <Accordion.Collapse eventKey="0">
          <Card.Body className="p-0 market-advanced-mode-widget-settings">{settings}</Card.Body>
        </Accordion.Collapse>
      ) : (
        <></>
      )}
    </Accordion>
  );
};
