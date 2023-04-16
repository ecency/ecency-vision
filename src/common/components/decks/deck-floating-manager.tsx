import React, { useContext, useState } from "react";
import "./_deck-floating-manager.scss";
import { DeckGridContext } from "./deck-manager";
import { pencilOutlineSvg, upArrowSvg } from "../../img/svg";
import { getColumnTitle, ICONS } from "./consts";

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
                  {type === "ac" ? "New column" : ""}
                  {type === "to" ? "Topics" : ""}
                  {type === "tr" ? "Trending" : ""}
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
          Add new column
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};
