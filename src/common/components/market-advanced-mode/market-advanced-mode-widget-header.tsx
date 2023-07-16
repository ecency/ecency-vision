import { chevronDownSvgForSlider, chevronUpSvgForSlider, hot } from "../../img/svg";
import { Button, Card } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import React, { useState } from "react";

interface Props {
  title?: string | JSX.Element;
  headerOptions?: JSX.Element;
  settings?: JSX.Element;
  icon?: JSX.Element;
  expandedHeader: boolean;
  setExpandedHeader: (value: boolean) => void;
}

export const MarketAdvancedModeWidgetHeader = ({
  title,
  headerOptions,
  settings,
  icon,
  expandedHeader,
  setExpandedHeader
}: Props) => {
  return (
    <Accordion className={expandedHeader ? "border-b border-[--border-color]" : ""}>
      <div className="d-flex flex-column border-b border-[--border-color]">
        <div className="d-flex justify-content-between align-items-center deck-header position-relative">
          <div className="d-flex align-items-center w-100">
            <div className="cursor-drag deck-index" />
            {headerOptions}
            {title ? (
              <div className="d-flex align-items-center ml-3">
                {typeof title === "string" ? (
                  <>
                    {icon ? <div className="icon mr-2">{icon}</div> : <></>}
                    <div className="header-title">{title}</div>
                  </>
                ) : (
                  title
                )}
              </div>
            ) : (
              <></>
            )}
          </div>
          {settings ? (
            <Accordion.Toggle as={Button} variant="link" eventKey="0" className="p-0">
              <div className={`pointer`} onClick={() => setExpandedHeader(!expandedHeader)}>
                <span>{expandedHeader ? chevronUpSvgForSlider : chevronDownSvgForSlider}</span>
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
