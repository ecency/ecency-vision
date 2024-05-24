"use client";

import { useState } from "react";
import { Accordion, AccordionCollapse, AccordionToggle } from "@ui/accordion";
import { Tooltip } from "@ui/tooltip";
import i18next from "i18next";
import { Button } from "@ui/button";
import { chevronDownSvgForSlider, chevronUpSvgForSlider } from "@ui/svg";

interface Props {
  categoryTitle: string;
  contentList: string[];
}

export function FaqCategoryClient({ contentList, categoryTitle }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="faq-container section-container">
      <Accordion className={expanded ? "border-b border-[--border-color]" : ""}>
        <AccordionToggle eventKey="0">
          <div
            className="section flex flex-col border-b border-[--border-color]"
            onClick={() => setExpanded?.(!expanded)}
          >
            <div className="flex justify-between items-center section-card relative">
              <div className="flex items-center">
                <div className="flex items-center ml-3">
                  <div className="section-title ml-1">{categoryTitle}</div>
                </div>
              </div>
              <Tooltip content={i18next.t("static.faq.toggle-icon-info")}>
                <AccordionToggle
                  as={Button}
                  appearance="link"
                  eventKey="0"
                  noPadding={true}
                  onClick={() => {
                    setExpanded?.(!expanded);
                  }}
                  icon={expanded ? chevronUpSvgForSlider : chevronDownSvgForSlider}
                />
              </Tooltip>
            </div>
          </div>
        </AccordionToggle>
        <AccordionCollapse eventKey="0">
          <div className="p-0">
            <div className="section-body">
              {contentList.map((x) => (
                <a key={x} className="section-content" href={`#${x}`}>
                  {i18next.t(`static.faq.${x}-header`)}
                </a>
              ))}
            </div>
          </div>
        </AccordionCollapse>
      </Accordion>
    </div>
  );
}
