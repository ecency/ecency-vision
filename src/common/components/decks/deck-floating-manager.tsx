import React, { useContext, useRef, useState } from "react";
import "./_deck-floating-manager.scss";
import { DeckGridContext } from "./deck-manager";
import { upArrowSvg } from "../../img/svg";
import { getColumnTitle, ICONS } from "./consts";
import { _t } from "../../i18n";
import { classNameObject } from "../../helper/class-name-object";

export const DeckFloatingManager = () => {
  const columnsRef = useRef<HTMLDivElement | null>(null);

  const { layout, add, scrollTo, getNextKey } = useContext(DeckGridContext);
  const [show, setShow] = useState(false);
  const [mobileOffset, setMobileOffset] = useState(0);

  return layout.columns.length > 0 ? (
    <div
      className={classNameObject({
        "deck-floating-manager": true,
        show,
        dragging: mobileOffset > 0
      })}
    >
      <div
        draggable="true"
        className="btn btn-primary dropdown-toggle"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onTouchEnd={() => {
          setShow(mobileOffset <= 75);
          setMobileOffset(0);
        }}
        onTouchMove={(e) => {
          const touchY = e.touches.item(0).clientY;
          const windowHeight = window.innerHeight;
          const resultInPercentage = (touchY / windowHeight) * 100;

          e.stopPropagation();

          setMobileOffset(resultInPercentage);
        }}
      >
        {upArrowSvg}
      </div>
      <div
        ref={columnsRef}
        className={classNameObject({
          columns: true,
          "columns-dragging": mobileOffset > 0
        })}
        style={{
          ...(mobileOffset > 0 && { transform: `translateY(${mobileOffset}%)` })
        }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onTouchEnd={() => setShow(false)}
      >
        <div className="columns-list">
          {layout.columns.map(({ type, key, settings }) => (
            <div
              className={"item " + type}
              onClick={() => {
                scrollTo(key);
                setShow(false);
              }}
              key={key + type}
            >
              {settings && "contentType" in settings
                ? ICONS[type][settings.contentType]
                : ICONS[type]}
              <div className="title">
                <div>{getColumnTitle(type, settings)}</div>
                <div className="primary">
                  {settings && "username" in settings && ["u", "w", "n"].includes(type) ? (
                    `@${settings.username}`
                  ) : (
                    <></>
                  )}
                  {settings && "query" in settings ? settings.query : <></>}
                  {settings && "username" in settings && ["co"].includes(type) ? (
                    settings.username
                  ) : (
                    <></>
                  )}
                  {settings && "host" in settings && ["th"].includes(type) ? (
                    <div className="text-capitalize">{settings.host}</div>
                  ) : (
                    <></>
                  )}
                  {type === "ac" ? _t("decks.columns.new-column") : ""}
                  {type === "to" ? _t("decks.columns.topics") : ""}
                  {type === "tr" ? _t("decks.columns.trending") : ""}
                  {type === "msf" ? _t("decks.columns.market-swap-form") : ""}
                  {type === "faq" ? _t("decks.columns.faq") : ""}
                  {type === "wb" ? _t("decks.columns.balance") : ""}
                  {type === "wn" ? _t("decks.columns.whats-new") : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div
          className="btn btn-outline-primary"
          onClick={() =>
            add({
              key: getNextKey(),
              type: "ac",
              settings: {}
            })
          }
        >
          {_t("decks.add-column")}
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};
