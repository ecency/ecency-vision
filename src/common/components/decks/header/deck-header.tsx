import React, { useState } from "react";
import { _t } from "../../../i18n";
import {
  chevronDownSvgForSlider,
  chevronUpSvgForSlider,
  deleteForeverSvg,
  dragSvg
} from "../../../img/svg";
import { DeckHeaderSettings } from "./deck-header-settings";
import { DeckHeaderReloading } from "./deck-header-reloading";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { classNameObject } from "../../../helper/class-name-object";
import Tooltip from "../../tooltip";
import { Button } from "@ui/button";
import { Accordion, AccordionCollapse, AccordionToggle } from "@ui/accordion";

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

  return (
    <div
      className={classNameObject({
        "deck-header": true,
        "header-sticky": props.sticky,
        primary: props.primary,
        expanded
      })}
    >
      <Accordion className={expanded ? "border-b border-[--border-color]" : ""}>
        <div className="deck-header relative">
          <div className="empty" />
          <div className="prefix">{props.prefix}</div>
          <div className="deck-index" {...props.draggable}>
            {props.draggable ? dragSvg : <></>}
          </div>
          {props.icon ? <div className="icon mr-2">{props.icon}</div> : <></>}

          <div className="header-title flex flex-col items-start">
            {"subtitle" in props ? (
              <div className="username">
                <small className="text-secondary">{props.subtitle}</small>
              </div>
            ) : (
              <></>
            )}
            <div className="title">{props.title}</div>
          </div>
          <Tooltip content={_t("decks.header-info")}>
            <AccordionToggle
              as={Button}
              appearance="link"
              eventKey="0"
              noPadding={true}
              className="accordion-toggle"
              iconClassName="justify-end"
              onClick={() => {
                setExpanded(!expanded);
              }}
              icon={expanded ? chevronUpSvgForSlider : chevronDownSvgForSlider}
            />
          </Tooltip>
        </div>
        <AccordionCollapse className="border-b border-[--border-color]" eventKey="0">
          <div className="p-0">
            <DeckHeaderSettings
              updateInterval={"updateIntervalMs" in props ? props.updateIntervalMs : undefined}
              setDeckUpdateInterval={
                "setUpdateIntervalMs" in props ? props.setUpdateIntervalMs : () => {}
              }
              title={props.title}
              username={props.account}
            />
            {"additionalSettings" in props && props.additionalSettings}

            <div className="flex deck-actions content-end p-2">
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
                  className="pr-0"
                  appearance="link"
                  onClick={() => props.onRemove()}
                  icon={deleteForeverSvg}
                  iconPlacement="left"
                >
                  {_t("decks.remove")}
                </Button>
              ) : (
                <></>
              )}
            </div>
          </div>
        </AccordionCollapse>
      </Accordion>
    </div>
  );
};
