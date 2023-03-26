import React, { useContext, useState } from "react";
import "./_deck-floating-manager.scss";
import { DeckGridContext } from "./deck-manager";
import { pencilOutlineSvg, upArrowSvg } from "../../img/svg";
import { getColumnTitle } from "./consts";

export const DeckFloatingManager = () => {
  const { layout, add } = useContext(DeckGridContext);
  const [show, setShow] = useState(false);

  const scrollToColumn = (key: number) => {
    document.getElementById(`${key - 1}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={"deck-floating-manager " + (show ? "show" : "")}>
      <div
        className="btn btn-primary dropdown-toggle"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {upArrowSvg}
      </div>
      <div
        className="columns"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <div className="columns-list">
          {layout.columns.map(({ type, key, settings }) => (
            <div className={"item " + type} onClick={() => scrollToColumn(key)} key={key + type}>
              {pencilOutlineSvg}
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
              key: layout.columns.length + 1,
              type: "ac",
              settings: {}
            })
          }
        >
          Add new column
        </div>
      </div>
    </div>
  );
};
