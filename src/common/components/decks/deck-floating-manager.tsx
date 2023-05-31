import React, { useContext, useState } from "react";
import "./_deck-floating-manager.scss";
import { DeckGridContext } from "./deck-manager";
import { upArrowSvg } from "../../img/svg";
import { getColumnTitle, ICONS } from "./consts";
import { _t } from "../../i18n";

export const DeckFloatingManager = () => {
  const { layout, add, scrollTo, getNextKey } = useContext(DeckGridContext);
  const [show, setShow] = useState(false);

  return layout.columns.length > 0 ? (
    <div className={"deck-floating-manager " + (show ? "show" : "")}>
      <div
        className="btn btn-primary dropdown-toggle"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onTouchEnd={() => setShow(true)}
      >
        {upArrowSvg}
      </div>
      <div
        className="columns"
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
