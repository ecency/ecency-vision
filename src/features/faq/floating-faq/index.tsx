import React, { useEffect, useRef, useState } from "react";
import {
  articleSvg,
  chevronDownSvgForSlider,
  chevronUpSvgForSlider,
  closeSvg,
  helpIconSvg
} from "@/assets/img/svg";
import data from "./path.json";
import "./index.scss";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { Accordion, AccordionCollapse, AccordionToggle } from "@ui/accordion";
import { faqKeysGeneral } from "@/consts";
import i18next from "i18next";
import { classNameObject } from "@ui/util";
import { Tooltip } from "@ui/tooltip";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import useClickAway from "react-use/lib/useClickAway";
import Link from "next/link";

export interface FaqObject {
  show: boolean;
}

export const handleFloatingContainer = (show: boolean) => {
  const detail: FaqObject = {
    show: show
  };
  const ev = new CustomEvent("handleShow", { detail });
  window.dispatchEvent(ev);
};

export const FloatingFAQ = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  const [show, setShow] = useState(false);
  const [display, setDisplay] = useState(false);
  const [expandedHelp, setExpandedHelp] = useState(true);
  const [helpClass, setHelpClass] = useState("section flex flex-col");
  const [contactClass, setContactClass] = useState("section flex flex-col");
  const [expandedContact, setExpandedContact] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [faqKeys, setFaqKeys] = useState<string[]>([]);
  const [defaultFaqKeys, setDefaultFaqKeys] = useState<string[]>([]);
  const [datatoShow, setDatatoShow] = useState<string[]>([]);
  const [innerWidth, setInnerWidth] = useState(0);
  const [isSubmitPage, setIsSubmitPage] = useState(false);

  useClickAway(rootRef, () => show && setShow(false));

  useEffect(() => {
    window.addEventListener("handleShow", onHandleShow);

    return () => {
      window.removeEventListener("handleShow", onHandleShow);
    };
  }, []);

  useEffect(() => {
    handleRouterChange();
  }, [pathname]);

  useEffect(() => {
    if (!searchText) {
      setDatatoShow(defaultFaqKeys);
      return;
    }

    let finalArray = Array.from(new Set(defaultFaqKeys.concat(faqKeys)));
    let searchResult: string[] = [];
    finalArray.map((x) => {
      const isSearchValid = i18next
        .t(`static.faq.${x}-body`)
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
      if (pathname.match(p.path)) {
        setDefaultFaqKeys(p.suggestions);
        setDatatoShow(p.suggestions);
      }
    }
  }, []);

  useEffect(() => {
    if (expandedHelp) {
      setHelpClass("section flex flex-col border-b border-[--border-color]");
    }
    if (expandedContact) {
      setContactClass("section flex flex-col border-b border-[--border-color]");
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
  };

  const handleRouterChange = () => {
    setShow(false);
    setDisplay(false);
    setIsSubmitPage(!!pathname.match("submit") || !!pathname.match("edit"));
    for (const p of data.faqPaths) {
      if (pathname.match(p.path)) {
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
      <div className="floating-faq-button" ref={rootRef}>
        {display && !isSubmitPage && (
          <Button
            noPadding={innerWidth < 768}
            className="fixed bottom-[4rem] md:bottom-4 right-4 w-[40px] h-[40px] md:w-auto md:h-[40px]"
            onClick={handleShow}
            icon={helpIconSvg}
            iconPlacement="left"
          >
            {innerWidth >= 768 ? i18next.t("floating-faq.help") : ""}
          </Button>
        )}

        <AnimatePresence>
          {show && display ? (
            <motion.div
              key="faq"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`floating-container origin-bottom-right ${
                isSubmitPage ? "r-[10rem]" : ""
              }`}
            >
              <div className="faq-welcome w-full">
                <h3 className="faq-welcome-message font-bold">
                  {i18next.t("floating-faq.welcome")}
                </h3>
                <Button
                  className={classNameObject({
                    "absolute top-4 right-4 text-white hover:opacity-50 hover:text-white": true
                  })}
                  appearance="gray-link"
                  onClick={() => setShow(false)}
                  icon={closeSvg}
                />
              </div>
              <div className="faq-content-list">
                <div className="faq-content-list-item">
                  <Accordion defaultActiveKey="0">
                    <AccordionToggle eventKey="0">
                      <div className={helpClass} onClick={() => setExpandedHelp(!expandedHelp)}>
                        <div className="flex justify-between items-center section-card relative">
                          <div className="flex items-center">
                            <div className="flex items-center ml-3">
                              <div className="section-title">
                                {i18next.t("floating-faq.need-help")}
                              </div>
                            </div>
                          </div>

                          <Tooltip content={i18next.t("floating-faq.toggle-icon-info")}>
                            <AccordionToggle
                              as={Button}
                              appearance="link"
                              noPadding={true}
                              eventKey="0"
                              onClick={() => {
                                setExpandedHelp(!expandedHelp);
                              }}
                              icon={expandedHelp ? chevronUpSvgForSlider : chevronDownSvgForSlider}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </AccordionToggle>

                    <AccordionCollapse eventKey="0">
                      <div className="help-content">
                        <div className="card-body">
                          <div className="mb-3 search-bar w-full">
                            <FormControl
                              type="text"
                              placeholder={i18next.t("floating-faq.search-placeholder")}
                              value={searchText}
                              onChange={(e) => {
                                setSearchText(e.target.value);
                              }}
                            />
                          </div>
                          {!searchText ? (
                            <p className="user-info">{i18next.t("floating-faq.suggestion")}</p>
                          ) : !datatoShow.length ? (
                            <p className="user-info">{i18next.t("floating-faq.no-results")}</p>
                          ) : (
                            ""
                          )}
                          {datatoShow.map((x) => {
                            return (
                              <a className="faq-article" href={`/faq#${x}`} target="_blank" key={x}>
                                <div className="faq-image">{articleSvg}</div>
                                {i18next.t(`static.faq.${x}-header`)}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </AccordionCollapse>
                  </Accordion>
                </div>
                <div className="faq-content-list-item contact-us p-4">
                  <Link target="_blank" href="/chats/hive-125126/channel">
                    {i18next.t("floating-faq.contact")}
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <></>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
