import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Card, Form } from "react-bootstrap";
import ClickAwayListener from "../clickaway-listener";
import { faqKeysGeneral } from "../../constants";
import {
  articleSvg,
  chevronDownSvgForSlider,
  chevronUpSvgForSlider,
  closeSvg,
  helpIconSvg
} from "../../img/svg";
import data from "./path.json";
import { _t } from "../../i18n";
import Tooltip from "../tooltip";
import "./index.scss";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { Accordion, AccordionCollapse, AccordionToggle } from "@ui/accordion";

export interface FaqObject {
  show: boolean;
  className: string;
}

export const handleFloatingContainer = (show: boolean, className: string) => {
  const detail: FaqObject = {
    show: show,
    className: className
  };
  const ev = new CustomEvent("handleShow", { detail });
  window.dispatchEvent(ev);
};

const FloatingFAQ = () => {
  const routerLocation = useLocation();
  const [show, setShow] = useState(false);
  const [display, setDisplay] = useState(false);
  const [expandedHelp, setExpandedHelp] = useState(true);
  const [helpClass, setHelpClass] = useState("section d-flex flex-column");
  const [contactClass, setContactClass] = useState("section d-flex flex-column");
  const [expandedContact, setExpandedContact] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [faqKeys, setFaqKeys] = useState<string[]>([]);
  const [defaultFaqKeys, setDefaultFaqKeys] = useState<string[]>([]);
  const [datatoShow, setDatatoShow] = useState<string[]>([]);
  const [innerWidth, setInnerWidth] = useState(0);
  const [isSubmitPage, setIsSubmitPage] = useState(false);
  const [className, setClassName] = useState("");

  useEffect(() => {
    window.addEventListener("handleShow", onHandleShow);

    return () => {
      window.removeEventListener("handleShow", onHandleShow);
    };
  }, []);

  useEffect(() => {
    handleRouterChange();
  }, [routerLocation]);

  useEffect(() => {
    if (!searchText) {
      setDatatoShow(defaultFaqKeys);
      return;
    }

    let finalArray = [...new Set(defaultFaqKeys.concat(faqKeys))];
    let searchResult: string[] = [];
    finalArray.map((x) => {
      const isSearchValid = _t(`static.faq.${x}-body`)
        .toLocaleLowerCase()
        .includes(searchText.toLocaleLowerCase());
      if (isSearchValid) {
        searchResult.push(x);
      }
    });

    setDatatoShow(searchResult);
  }, [searchText]);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
    const faqKeys = [...faqKeysGeneral];
    setFaqKeys(faqKeys);
    for (const p of data.faqPaths) {
      if (routerLocation.pathname.match(p.path)) {
        setDefaultFaqKeys(p.suggestions);
        setDatatoShow(p.suggestions);
      }
    }
  }, []);

  useEffect(() => {
    if (expandedHelp) {
      setHelpClass("section d-flex flex-column border-b border-[--border-color]");
    }
    if (expandedContact) {
      setContactClass("section d-flex flex-column border-b border-[--border-color]");
    }
  }, [expandedHelp, expandedContact]);

  useEffect(() => {
    if (display) {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [display]);

  const onHandleShow = (e: Event) => {
    const detail = (e as CustomEvent).detail as FaqObject;
    setShow(detail.show);
    setClassName(detail.className);
  };

  const handleRouterChange = () => {
    setShow(false);
    setDisplay(false);
    setIsSubmitPage(!!routerLocation.pathname.match("submit"));
    for (const p of data.faqPaths) {
      if (routerLocation.pathname.match(p.path)) {
        setDisplay(true);
        setDatatoShow(p.suggestions);
        setDefaultFaqKeys(p.suggestions);
        break;
      }
    }
  };

  const handleResize = () => {
    setInnerWidth(window.innerWidth);
  };

  const handleShow = () => {
    setShow(!show);
  };
  return (
    <>
      {
        <>
          <ClickAwayListener
            className="floating-faq-button"
            onClickAway={() => show && setShow(false)}
          >
            {display && !isSubmitPage && (
              <Button
                className="help-btn"
                onClick={handleShow}
                icon={helpIconSvg}
                iconPlacement="left"
                size="sm"
              >
                {innerWidth >= 792 ? _t("floating-faq.help") : ""}
              </Button>
            )}

            {show && display ? (
              <div className={`floating-container ${isSubmitPage ? className : ""}`}>
                <div className="faq-welcome">
                  <h3 className="faq-welcome-message">{_t("floating-faq.welcome")}</h3>
                  <Button
                    appearance="link"
                    className="close-btn"
                    onClick={() => {
                      setShow(false);
                    }}
                    icon={closeSvg}
                  />
                </div>
                <div className="faq-content-list">
                  <div className="faq-content-list-item">
                    <Accordion defaultActiveKey="0">
                      <AccordionToggle as={Card} eventKey="0">
                        <div className={helpClass} onClick={() => setExpandedHelp(!expandedHelp)}>
                          <div className="d-flex justify-content-between align-items-center section-card position-relative">
                            <div className="d-flex align-items-center">
                              <div className="d-flex align-items-center ml-3">
                                <div className="section-title">{_t("floating-faq.need-help")}</div>
                              </div>
                            </div>

                            <Tooltip content={_t("floating-faq.toggle-icon-info")}>
                              <AccordionToggle
                                as={Button}
                                appearance="link"
                                noPadding={true}
                                eventKey="0"
                                onClick={() => {
                                  setExpandedHelp(!expandedHelp);
                                }}
                                icon={
                                  expandedHelp ? chevronUpSvgForSlider : chevronDownSvgForSlider
                                }
                              />
                            </Tooltip>
                          </div>
                        </div>
                      </AccordionToggle>

                      <AccordionCollapse eventKey="0">
                        <div className="help-content">
                          <div className="card-body p-3">
                            <Form.Group className="search-bar w-100">
                              <FormControl
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
                                <a
                                  className="faq-article"
                                  href={`/faq#${x}`}
                                  target="_blank"
                                  key={x}
                                >
                                  <div className="faq-image">{articleSvg}</div>
                                  {_t(`static.faq.${x}-header`)}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      </AccordionCollapse>
                    </Accordion>
                  </div>
                  <div className="faq-content-list-item contact-us">
                    <Accordion>
                      <AccordionToggle as={Card} eventKey="1">
                        <div
                          className={contactClass}
                          onClick={() => setExpandedContact(!expandedContact)}
                        >
                          <div className="d-flex justify-content-between align-items-center section-card position-relative">
                            <div className="d-flex align-items-center">
                              <div className="d-flex align-items-center ml-3">
                                <div className="section-title">{_t("floating-faq.contact")}</div>
                              </div>
                            </div>
                            <Tooltip content={_t("floating-faq.toggle-icon-info")}>
                              <AccordionToggle
                                as={Button}
                                appearance="link"
                                eventKey="1"
                                noPadding={true}
                                onClick={() => {
                                  setExpandedContact(!expandedContact);
                                }}
                                icon={
                                  expandedContact ? chevronUpSvgForSlider : chevronDownSvgForSlider
                                }
                              />
                            </Tooltip>
                          </div>
                        </div>
                      </AccordionToggle>
                      <AccordionCollapse eventKey="1">
                        <div className="card-body p-3">
                          <Form.Group>
                            <InputGroup className="username" prepend="@">
                              <FormControl
                                type="text"
                                autoFocus={true}
                                required={true}
                                placeholder={_t("floating-faq.username")}
                              />
                            </InputGroup>
                          </Form.Group>
                          <Form.Group>
                            <InputGroup className="message">
                              <FormControl
                                type="textarea"
                                autoFocus={true}
                                required={true}
                                maxLength={1000}
                                placeholder={_t("floating-faq.message")}
                              />
                            </InputGroup>
                          </Form.Group>
                          <Button
                            className="submit-btn"
                            type="submit"
                            onClick={() =>
                              window.open(
                                "mailto:bug@ecency.com?Subject=Reporting issue&Body=Hello team, \n I would like to report issue: \n",
                                "_blank"
                              )
                            }
                          >
                            {_t("floating-faq.submit")}
                          </Button>
                        </div>
                      </AccordionCollapse>
                    </Accordion>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </ClickAwayListener>
        </>
      }
    </>
  );
};

export default FloatingFAQ;
