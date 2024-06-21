import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { GenericDeckColumn } from "./generic-deck-column";
import React, { useEffect, useState } from "react";
import { FormControl } from "@ui/input";
import { faqKeysGeneral } from "@/consts";
import i18next from "i18next";
import { articleSvg } from "@ui/svg";

interface Props {
  id: string;
  draggable?: DraggableProvidedDragHandleProps | null;
}

export const DeckFaqColumn = ({ id, draggable }: Props) => {
  const [expandedHelp, setExpandedHelp] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [dataToShow, setDataToShow] = useState<string[]>([...faqKeysGeneral]);

  useEffect(() => {
    setDataToShow(
      faqKeysGeneral.filter((key) =>
        i18next
          .t(`static.faq.${key}-header`)
          .toLocaleLowerCase()
          .includes(searchText.toLocaleLowerCase())
      )
    );
  }, [searchText]);

  return (
    <GenericDeckColumn
      id={id}
      draggable={draggable}
      header={{
        title: i18next.t("decks.columns.faq"),
        subtitle: i18next.t("decks.columns.faq-subtitle"),
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
                placeholder={i18next.t("floating-faq.search-placeholder")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            {!searchText ? (
              <p className="suggest-label">{i18next.t("floating-faq.suggestion")}</p>
            ) : !dataToShow.length ? (
              <p className="suggest-label">{i18next.t("floating-faq.no-results")}</p>
            ) : (
              ""
            )}
            <div className="faq-content">
              {dataToShow.map((x) => {
                return (
                  <a className="faq-article" href={`/faq#${x}`} target="_blank" key={x}>
                    <div className="faq-image">{articleSvg}</div>
                    {i18next.t(`static.faq.${x}-header`)}
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
