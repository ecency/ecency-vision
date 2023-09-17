import { chevronDownSvgForSlider, chevronUpSvgForSlider } from "../../img/svg";
import React from "react";
import { Button } from "@ui/button";
import { Accordion, AccordionCollapse, AccordionToggle } from "@ui/accordion";

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
      <div className="flex flex-col border-b border-[--border-color]">
        <div className="flex justify-cbetween items-center deck-header relative">
          <div className="flex items-center w-full">
            <div className="cursor-drag deck-index" />
            {headerOptions}
            {title ? (
              <div className="flex items-center ml-3">
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
            <AccordionToggle
              as={Button}
              appearance="link"
              eventKey="0"
              noPadding={true}
              onClick={() => setExpandedHeader(!expandedHeader)}
              icon={expandedHeader ? chevronUpSvgForSlider : chevronDownSvgForSlider}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
      {settings ? (
        <AccordionCollapse eventKey="0">
          <div className="p-0 market-advanced-mode-widget-settings">{settings}</div>
        </AccordionCollapse>
      ) : (
        <></>
      )}
    </Accordion>
  );
};
