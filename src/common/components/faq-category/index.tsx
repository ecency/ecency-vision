import React, { useState } from "react";
import { chevronDownSvgForSlider, chevronUpSvgForSlider } from "../../img/svg";
import { _t } from "../../i18n";
import "./index.scss";
import Tooltip from "../tooltip";
import { Button } from "@ui/button";
import { Accordion, AccordionCollapse, AccordionToggle } from "@ui/accordion";

interface Props {
  categoryTitle: string;
  contentList: string[];
}

const FaqCategory = (props: Props) => {
  const [expanded, setExpanded] = useState(false);

  const { contentList, categoryTitle } = props;
  return (
    <div className="faq-container section-container">
      <Accordion className={expanded ? "border-b border-[--border-color]" : ""}>
        <AccordionToggle eventKey="0">
          <div
            className="section flex flex-col border-b border-[--border-color]"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex justify-between items-center section-card relative">
              <div className="flex items-center">
                <div className="flex items-center ml-3">
                  <div className="section-title ml-1">{categoryTitle}</div>
                </div>
              </div>
              <Tooltip content={_t("static.faq.toggle-icon-info")}>
                <AccordionToggle
                  as={Button}
                  appearance="link"
                  eventKey="0"
                  noPadding={true}
                  onClick={() => {
                    setExpanded(!expanded);
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
                  {_t(`static.faq.${x}-header`)}
                </a>
              ))}
            </div>
          </div>
        </AccordionCollapse>
      </Accordion>
    </div>
  );
};

export default FaqCategory;
