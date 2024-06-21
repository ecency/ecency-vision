import { DeckHeader } from "../../header/deck-header";
import React, { useContext, useState } from "react";
import { DeckGridItem } from "../../types";
import "./_deck-add-column.scss";
import { DeckAddColumnTypeSettings } from "./deck-add-column-type-settings";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { DeckGridContext } from "../../deck-manager";
import {
  communityIconSvg,
  faqIconSvg,
  notificationsIconSvg,
  searchIconSvg,
  swapFormSvg,
  threadSvg,
  topicsIconSvg,
  trendingIconSvg,
  userIconSvg,
  walletIconSvg,
  whatsNewIconSvg
} from "../../icons";
import { Button } from "@ui/button";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { arrowLeftSvg } from "@ui/svg";

interface Props {
  id: string;
  deckKey: number;
  draggable?: DraggableProvidedDragHandleProps | null;
}

interface AvailableColumn {
  type: DeckGridItem["type"];
  title: string;
  icon: JSX.Element;
  description: string;
}

const CurrentThreadsDescriptionIndex = Math.floor(Math.random() * 3) + 1;

export const DeckAddColumn = ({ id, draggable, deckKey }: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { add, deleteColumn } = useContext(DeckGridContext);

  const availableColumns: AvailableColumn[] = [
    {
      type: "u",
      title: i18next.t("decks.columns.user"),
      icon: userIconSvg,
      description: i18next.t("decks.columns.user-description")
    },
    {
      type: "co",
      title: i18next.t("decks.columns.community"),
      icon: communityIconSvg,
      description: i18next.t("decks.columns.community-description")
    },
    {
      type: "th",
      title: i18next.t("decks.columns.threads"),
      icon: threadSvg,
      description: i18next.t(`decks.columns.threads-description${CurrentThreadsDescriptionIndex}`)
    },
    {
      type: "w",
      title: i18next.t("decks.columns.wallet"),
      icon: walletIconSvg,
      description: i18next.t("decks.columns.wallet-description")
    },
    {
      type: "n",
      title: i18next.t("decks.columns.notifications"),
      icon: notificationsIconSvg,
      description: i18next.t("decks.columns.notifications-description")
    },
    {
      type: "tr",
      title: i18next.t("decks.columns.trending"),
      icon: trendingIconSvg,
      description: i18next.t("decks.columns.trending-description")
    },
    {
      type: "to",
      title: i18next.t("decks.columns.topics"),
      icon: topicsIconSvg,
      description: i18next.t("decks.columns.topics-description")
    },
    {
      type: "msf",
      title: i18next.t("decks.columns.market-swap-form"),
      icon: swapFormSvg,
      description: i18next.t("decks.columns.msf-description")
    },
    {
      type: "s",
      title: i18next.t("decks.columns.search"),
      icon: searchIconSvg,
      description: i18next.t("decks.columns.search-description")
    },
    {
      type: "faq",
      title: i18next.t("decks.columns.faq"),
      icon: faqIconSvg,
      description: i18next.t("decks.columns.faq-description")
    },
    {
      type: "wn",
      title: i18next.t("decks.columns.whats-new"),
      icon: whatsNewIconSvg,
      description: i18next.t("decks.columns.whats-new-description")
    }
  ];
  const typesWithoutSettings = ["tr", "to", "msf", "faq", "wn"];

  const [step, setStep] = useState<"select" | "setup">("select");
  const [selectedType, setSelectedType] = useState<DeckGridItem["type"] | null>(null);

  return (
    <div className="deck deck-add-column native-scroll">
      <DeckHeader
        draggable={draggable}
        primary={true}
        sticky={true}
        account={activeUser?.username ?? ""}
        onRemove={() => deleteColumn(id)}
        onReload={() => {}}
        title={
          availableColumns.find((col) => col.type === selectedType)?.title ??
          i18next.t("decks.add-column")
        }
        prefix={
          selectedType ? (
            <Button
              appearance="link"
              className="px-0"
              onClick={() => {
                setStep("select");
                setSelectedType(null);
              }}
              icon={arrowLeftSvg}
            />
          ) : (
            <></>
          )
        }
      />
      <div className="deck-content">
        {step === "select" ? (
          <>
            <div className="subtitle p-3">{i18next.t("decks.choose-one")}</div>
            {availableColumns.map(({ icon, title, type, description }) => (
              <div
                key={type}
                className="item"
                onClick={() => {
                  if (typesWithoutSettings.includes(type)) {
                    add({
                      key: deckKey,
                      type,
                      settings: {
                        updateIntervalMs: 60000
                      }
                    });
                  } else {
                    setStep("setup");
                  }
                  setSelectedType(type);
                }}
              >
                {icon}
                <div className="title">{title}</div>
                <div className="description">{description}</div>
              </div>
            ))}
          </>
        ) : (
          <></>
        )}
        {step === "setup" && selectedType ? (
          <DeckAddColumnTypeSettings deckKey={deckKey} type={selectedType} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
