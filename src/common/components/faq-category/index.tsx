import React, { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import { Card } from "react-bootstrap";
import { chevronDownSvgForSlider, chevronUpSvgForSlider } from "../../img/svg";
import { _t } from "../../i18n";
import "./index.scss";
import Tooltip from "../tooltip";
import { Button } from "@ui/button";

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
        <Accordion.Toggle as={Card} eventKey="0">
          <div
            className="section d-flex flex-column border-b border-[--border-color]"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="d-flex justify-content-between align-items-center section-card position-relative">
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center ml-3">
                  <div className="section-title ml-1">{categoryTitle}</div>
                </div>
              </div>
              <Tooltip content={_t("static.faq.toggle-icon-info")}>
                <Accordion.Toggle
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
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <div className="p-0">
            <div className="section-body">
              {contentList.map((x) => (
                <a key={x} className="section-content" href={`#${x}`}>
                  {_t(`static.faq.${x}-header`)}
                </a>
              ))}
            </div>
          </div>
        </Accordion.Collapse>
      </Accordion>
    </div>
  );
};

export default FaqCategory;
