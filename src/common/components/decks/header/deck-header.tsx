import React, { useState } from "react";
import { Button, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { _t } from "../../../i18n";
import Accordion from "react-bootstrap/Accordion";
import {
  chevronDownSvgForSlider,
  chevronUpSvgForSlider,
  deleteForeverSvg,
  hot
} from "../../../img/svg";
import { DeckHeaderSettings } from "./deck-header-settings";
import { DeckHeaderReloading } from "./deck-header-reloading";

export interface Props {
  title: string;
  icon?: JSX.Element;
  account: string;
  sticky?: boolean;
  primary?: boolean;
  prefix?: JSX.Element;
}

export interface WithDeletionProps extends Props {
  onRemove: () => void;
}

export interface WithIntervalProps extends Props {
  updateIntervalMs: number;
  isReloading: boolean;
  onReload: () => void;
}

export const DeckHeader = (props: Props | WithIntervalProps | WithDeletionProps) => {
  const [expanded, setExpanded] = useState(false);

  let splittedTitle = props.title.split("@");
  let onlyTitle = splittedTitle[0];
  let username = splittedTitle[1];
  let tooltip = (
    <Tooltip id="profile-tooltip" style={{ zIndex: 10 }}>
      {_t("decks.header-info")}
    </Tooltip>
  );

  return (
    <div
      className={
        "deck-header" + (props.sticky ? " header-sticky" : "") + (props.primary ? " primary" : "")
      }
    >
      <Accordion className={expanded ? "border-bottom" : ""}>
        <div className="deck-header position-relative">
          {props.prefix}
          <div className="deck-index" />
          {props.icon ? <div className="icon mr-2">{props.icon}</div> : <></>}
          <div className="header-title">{onlyTitle}</div>
          {username && (
            <div className="ml-1 username">
              <small className="text-lowercase text-secondary">@{username.toLowerCase()}</small>
            </div>
          )}
          <OverlayTrigger placement="bottom" overlay={tooltip}>
            <Accordion.Toggle
              as={Button}
              variant="link"
              eventKey="0"
              className="p-0 accordion-toggle"
            >
              <div
                className={`pointer`}
                onClick={() => {
                  setExpanded(!expanded);
                }}
              >
                <span>{expanded ? chevronUpSvgForSlider : chevronDownSvgForSlider}</span>
              </div>
            </Accordion.Toggle>
          </OverlayTrigger>
        </div>
        <Accordion.Collapse eventKey="0">
          <Card.Body className="p-0">
            <DeckHeaderSettings
              updateInterval={"updateIntervalMs" in props ? props.updateIntervalMs : undefined}
              title={props.title}
              username={props.account}
            />
            <div className="d-flex deck-actions justify-content-end p-2">
              {"updateIntervalMs" in props ? (
                <DeckHeaderReloading
                  onReload={props.onReload}
                  isReloading={props.isReloading}
                  updateDataInterval={props.updateIntervalMs}
                />
              ) : (
                <></>
              )}

              {"onRemove" in props ? (
                <Button
                  size="sm"
                  className="d-flex align-items-center pr-0"
                  variant="link"
                  onClick={() => props.onRemove()}
                >
                  <div className="deck-options-icon d-flex mr-1">{deleteForeverSvg}</div>
                  <span>{_t("decks.remove")}</span>
                </Button>
              ) : (
                <></>
              )}
            </div>
          </Card.Body>
        </Accordion.Collapse>
      </Accordion>
    </div>
  );
};
