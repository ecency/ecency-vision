import { GenericDeckColumn } from "./generic-deck-column";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./_deck-whats-new-column.scss";
import { markdownToHTML } from "@ecency/render-helper/lib/methods";
import appPackage from "../../../../../package.json";
import { DeckGridContext } from "../deck-manager";
import { ReloadableDeckGridItem } from "../types";
import { Accordion, AccordionCollapse, AccordionToggle } from "@ui/accordion";
import i18next from "i18next";

interface Props {
  id: string;
  draggable?: DraggableProvidedDragHandleProps | null;
  settings: ReloadableDeckGridItem["settings"];
}

interface ReleaseItem {
  name: string;
  body: string;
}

export const DeckWhatsNewColumn = ({ id, draggable, settings }: Props) => {
  const { updateColumnIntervalMs } = useContext(DeckGridContext);

  const [releasesList, setReleasesList] = useState<ReleaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    setIsLoading(true);

    try {
      const response = await axios.get(
        "https://api.github.com/repos/ecency/ecency-vision/releases"
      );
      if (response.data as ReleaseItem[]) {
        setReleasesList(response.data);
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GenericDeckColumn
      id={id}
      draggable={draggable}
      header={{
        title: i18next.t("decks.columns.whats-new"),
        subtitle: i18next.t("decks.columns.updates"),
        icon: null,
        updateIntervalMs: settings.updateIntervalMs,
        setUpdateIntervalMs: (v) => updateColumnIntervalMs(id, v)
      }}
      isReloading={isLoading}
      onReload={() => fetch()}
    >
      <div className="wn-container">
        <p className="wn-label">{i18next.t("decks.columns.release-list")}</p>
        {!isLoading &&
          releasesList.map((item) => (
            <Accordion key={item.name}>
              <AccordionToggle as="div" eventKey="1">
                <div className="wn-item">
                  {item.name}
                  {item.name === appPackage.version && (
                    <div className="bg-blue-dark-sky px-2 py-1 text-xs font-bold text-white rounded">
                      {i18next.t("decks.columns.current")}
                    </div>
                  )}
                </div>
              </AccordionToggle>
              <AccordionCollapse eventKey="1">
                <div
                  className="wn-item-content"
                  dangerouslySetInnerHTML={{ __html: markdownToHTML(item.body, false, true) }}
                />
              </AccordionCollapse>
            </Accordion>
          ))}
        {isLoading && (
          <div className="skeleton-list pt-0">
            {Array.from(new Array(20)).map((_, i) => (
              <div key={i} className="list-item-skeleton wn-item-skeleton">
                <div className="title" />
              </div>
            ))}
          </div>
        )}
      </div>
    </GenericDeckColumn>
  );
};
