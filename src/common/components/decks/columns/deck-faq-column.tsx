import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { GenericDeckColumn } from "./generic-deck-column";
import { _t } from "../../../i18n";
import React, { useEffect, useState } from "react";
import { articleSvg } from "../../../img/svg";
import { faqKeysGeneral } from "../../../constants";
import { FormControl } from "@ui/input";

interface Props {
  id: string;
  draggable?: DraggableProvidedDragHandleProps;
}

export const DeckFaqColumn = ({ id, draggable }: Props) => {
  const [expandedHelp, setExpandedHelp] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [dataToShow, setDataToShow] = useState<string[]>([...faqKeysGeneral]);

  useEffect(() => {
    setDataToShow(
      faqKeysGeneral.filter((key) =>
        _t(`static.faq.${key}-header`).toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
      )
    );
  }, [searchText]);

  return (
    <GenericDeckColumn
      id={id}
      draggable={draggable}
      header={{
        title: _t("decks.columns.faq"),
        subtitle: _t("decks.columns.faq-subtitle"),
        icon: null
      }}
      isReloading={false}
      onReload={() => {}}
    >
      <div className="deck-faq-container">
        <div
          className={expandedHelp ? "section flex flex-col border-b border-[--border-color]" : ""}
          onClick={() => setExpandedHelp(!expandedHelp)}
        >
          <div className="help-content p-3">
            <div className="search-bar w-full mb-4">
              <FormControl
                type="text"
                placeholder={_t("floating-faq.search-placeholder")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            {!searchText ? (
              <p className="suggest-label">{_t("floating-faq.suggestion")}</p>
            ) : !dataToShow.length ? (
              <p className="suggest-label">{_t("floating-faq.no-results")}</p>
            ) : (
              ""
            )}
            <div className="faq-content">
              {dataToShow.map((x) => {
                return (
                  <a className="faq-article" href={`/faq#${x}`} target="_blank" key={x}>
                    <div className="faq-image">{articleSvg}</div>
                    {_t(`static.faq.${x}-header`)}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </GenericDeckColumn>
  );
};
