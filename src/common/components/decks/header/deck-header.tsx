import React, { useState } from "react";
import { Button, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { _t } from "../../../i18n";
import Accordion from "react-bootstrap/Accordion";
import {
  chevronDownSvgForSlider,
  chevronUpSvgForSlider,
  deleteForeverSvg,
  dragSvg,
  hot
} from "../../../img/svg";
import { DeckHeaderSettings } from "./deck-header-settings";
import { DeckHeaderReloading } from "./deck-header-reloading";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { classNameObject } from "../../../helper/class-name-object";

export interface Props {
  title: string;
  subtitle?: string;
  icon?: JSX.Element;
  account: string;
  sticky?: boolean;
  primary?: boolean;
  prefix?: JSX.Element;
  draggable?: DraggableProvidedDragHandleProps;
  additionalSettings?: JSX.Element;
}

export interface WithDeletionProps extends Props {
  onRemove: () => void;
}

export interface WithIntervalProps extends Props {
  updateIntervalMs: number;
  setUpdateIntervalMs: (v: number) => void;
  isReloading: boolean;
  onReload: () => void;
}

export type AllProps = Props & WithDeletionProps & WithIntervalProps;

export const DeckHeader = (props: Props | WithIntervalProps | WithDeletionProps | AllProps) => {
  const [expanded, setExpanded] = useState(false);

  let tooltip = (
    <Tooltip id="profile-tooltip" style={{ zIndex: 10 }}>
      {_t("decks.header-info")}
    </Tooltip>
  );

  return (
    <div
      className={classNameObject({
        "deck-header": true,
        "header-sticky": props.sticky,
        primary: props.primary,
        expanded
      })}
    >
      <Accordion className={expanded ? "border-bottom" : ""}>
        <div className="deck-header position-relative">
          <div className="empty" />
          <div className="prefix">{props.prefix}</div>
          <div className="deck-index" {...props.draggable}>
            {props.draggable ? dragSvg : <></>}
          </div>
          {props.icon ? <div className="icon mr-2">{props.icon}</div> : <></>}

          <div className="header-title d-flex flex-column align-items-start">
            {"subtitle" in props ? (
              <div className="username">
                <small className="text-secondary">{props.subtitle}</small>
              </div>
            ) : (
              <></>
            )}
            <div className="title">{props.title}</div>
          </div>
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
              setDeckUpdateInterval={
                "setUpdateIntervalMs" in props ? props.setUpdateIntervalMs : () => {}
              }
              title={props.title}
              username={props.account}
            />
            {"additionalSettings" in props && props.additionalSettings}

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
