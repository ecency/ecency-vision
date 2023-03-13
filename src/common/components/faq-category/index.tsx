import React, { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import { Button, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import { chevronDownSvgForSlider, chevronUpSvgForSlider } from "../../img/svg";
import { _t } from "../../i18n";
import "./index.scss";

interface Props {
  categoryTitle: string;
  contentList: string[];
}

const FaqCategory = (props: Props) => {
  const [expanded, setExpanded] = useState(false);
  const tooltip = (
    <Tooltip id="faq-toggleIcon-tooltip" style={{ zIndex: 10 }}>
      {_t("static.faq.toggle-icon-info")}
    </Tooltip>
  );

  const { contentList, categoryTitle } = props;
  return (
    <div className="faq-container section-container">
      <Accordion className={expanded ? "border-bottom" : ""}>
        <Accordion.Toggle as={Card} eventKey="0">
          <div
            className="section d-flex flex-column border-bottom"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="d-flex justify-content-between align-items-center section-card position-relative">
              <div className="d-flex align-items-center">
                <div className="d-flex align-items-center ml-3">
                  <div className="section-title ml-1">{categoryTitle}</div>
                </div>
              </div>
              <OverlayTrigger placement="bottom" overlay={tooltip}>
                <Accordion.Toggle as={Button} variant="link" eventKey="0" className="p-0">
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
          </div>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <Card.Body className="p-0">
            <div className="section-body">
              {contentList.map((x) => (
                <a key={x} className="section-content" href={`#${x}`}>
                  {_t(`static.faq.${x}-header`)}
                </a>
              ))}
            </div>
          </Card.Body>
        </Accordion.Collapse>
      </Accordion>
    </div>
  );
};

export default FaqCategory;
