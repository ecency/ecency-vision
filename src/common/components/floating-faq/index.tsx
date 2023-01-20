import React, { useEffect, useState } from "react";
import { Button, Card, OverlayTrigger, Tooltip, Form, InputGroup } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";

import { faqKeysGeneral } from "../../constants";

import {
  helpIconSvg,
  chevronDownSvgForSlider,
  chevronUpSvgForSlider,
  closeSvg,
  articleSvg
} from "../../img/svg";

import { _t } from "../../i18n";

const FloatingFAQ = () => {
  const [show, setShow] = useState(false);
  const [expandedHelp, setExpandedHelp] = useState(true);
  const [expandedContact, setExpandedContact] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [faqKeys, setFaqKeys] = useState<string[]>([]);
  const [defaultFaqKeys, setDefaultFaqKeys] = useState<string[]>([]);
  const [datatoShow, setDatatoShow] = useState<string[]>([]);

  const tooltip = (
    <Tooltip id="floating-faq-tooltip" style={{ zIndex: 10000 }}>
      {_t("floating-faq.toggle-icon-info")}
    </Tooltip>
  );

  useEffect(() => {
    let searchResult: string[] = [];
    faqKeys.map((x) => {
      let isSearchValid = _t(`static.faq.${x}-body`)
        .toLocaleLowerCase()
        .includes(searchText.toLocaleLowerCase());
      if (isSearchValid) {
        searchResult.push(x);
      }
      setDatatoShow(searchResult);
    });
    if (!searchText) {
      setDatatoShow(defaultFaqKeys);
    }
  }, [searchText]);

  useEffect(() => {
    let faqKeys = [...faqKeysGeneral];
    setFaqKeys(faqKeys);
    setDefaultFaqKeys(faqKeys.slice(0, 4));
    setDatatoShow(faqKeys.slice(0, 4));
  }, []);

  let cls_help = expandedHelp
    ? "section d-flex flex-column border-bottom"
    : "section d-flex flex-column";
  let cls_contact = expandedContact
    ? "section d-flex flex-column border-bottom"
    : "section d-flex flex-column";

  return (
    <>
      <Button
        className="help-btn"
        onClick={() => {
          setShow(!show);
        }}
      >
        {helpIconSvg}
        <div className="help">{_t("floating-faq.help")}</div>
      </Button>
      {show ? (
        <div className="faq-container">
          <div className="faq-welcome">
            <h3 className="faq-welcome-message">{_t("floating-faq.welcome")}</h3>
            <Button
              className="close-btn"
              onClick={() => {
                setShow(!show);
              }}
            >
              {closeSvg}
            </Button>
          </div>
          <div className="faq-content-list">
            <div className="faq-content-list-item">
              <Accordion defaultActiveKey="0">
                <div className={cls_help}>
                  <div className="d-flex justify-content-between align-items-center section-card position-relative">
                    <div className="d-flex align-items-center">
                      <div className="d-flex align-items-center ml-3">
                        <div className="section-title">{_t("floating-faq.need-help")}</div>
                      </div>
                    </div>
                    <OverlayTrigger placement="bottom" overlay={tooltip}>
                      <Accordion.Toggle as={Button} variant="link" eventKey="0" className="p-0">
                        <div
                          className={`pointer`}
                          onClick={() => {
                            setExpandedHelp(!expandedHelp);
                          }}
                        >
                          <span>
                            {expandedHelp ? chevronUpSvgForSlider : chevronDownSvgForSlider}
                          </span>
                        </div>
                      </Accordion.Toggle>
                    </OverlayTrigger>
                  </div>
                </div>
                <Accordion.Collapse eventKey="0">
                  <div className="help-content">
                    <Card.Body>
                      <Form.Group className="search-bar w-100">
                        <Form.Control
                          type="text"
                          placeholder={_t("floating-faq.search-placeholder")}
                          value={searchText}
                          onChange={(e) => {
                            setSearchText(e.target.value);
                          }}
                        />
                      </Form.Group>
                      {!searchText ? (
                        <p className="user-info">{_t("floating-faq.suggestion")}</p>
                      ) : !datatoShow.length ? (
                        <p className="user-info">{_t("floating-faq.no-results")}</p>
                      ) : (
                        ""
                      )}
                      {datatoShow.map((x) => {
                        return (
                          <a className="faq-article" href={`/faq#${x}`} key={x}>
                            <div className="faq-image">{articleSvg}</div>
                            {_t(`static.faq.${x}-header`)}
                          </a>
                        );
                      })}
                    </Card.Body>
                  </div>
                </Accordion.Collapse>
              </Accordion>
            </div>
            <div className="faq-content-list-item contact-us">
              <Accordion>
                <div className={cls_contact}>
                  <div className="d-flex justify-content-between align-items-center section-card position-relative">
                    <div className="d-flex align-items-center">
                      <div className="d-flex align-items-center ml-3">
                        <div className="section-title">{_t("floating-faq.contact")}</div>
                      </div>
                    </div>
                    <OverlayTrigger placement="bottom" overlay={tooltip}>
                      <Accordion.Toggle as={Button} variant="link" eventKey="1" className="p-0">
                        <div
                          className={`pointer`}
                          onClick={() => {
                            setExpandedContact(!expandedContact);
                          }}
                        >
                          <span>
                            {expandedContact ? chevronUpSvgForSlider : chevronDownSvgForSlider}
                          </span>
                        </div>
                      </Accordion.Toggle>
                    </OverlayTrigger>
                  </div>
                </div>
                <Accordion.Collapse eventKey="1">
                  <Card.Body className="p-3">
                    <Form.Group>
                      <InputGroup size="sm" className="username">
                        <InputGroup.Prepend>
                          <InputGroup.Text>@</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          autoFocus={true}
                          required={true}
                          placeholder={_t("floating-faq.username")}
                        />
                      </InputGroup>
                    </Form.Group>
                    <Form.Group>
                      <InputGroup size="sm" className="message">
                        <Form.Control
                          as="textarea"
                          type="text"
                          autoFocus={true}
                          required={true}
                          maxLength={1000}
                          placeholder={_t("floating-faq.message")}
                        />
                      </InputGroup>
                    </Form.Group>
                    <Button className="submit-btn" variant="primary" type="submit">
                      {_t("floating-faq.submit")}
                    </Button>
                  </Card.Body>
                </Accordion.Collapse>
              </Accordion>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default FloatingFAQ;
