import { DeckHeader } from "../../header/deck-header";
import React, { useContext, useState } from "react";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { _t } from "../../../../i18n";
import { DeckGridItem } from "../../types";
import { arrowLeftSvg } from "../../../../img/svg";
import "./_deck-add-column.scss";
import { DeckAddColumnTypeSettings } from "./deck-add-column-type-settings";
import { Button } from "react-bootstrap";
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
  walletIconSvg
} from "../../icons";

interface Props {
  id: string;
  deckKey: number;
  draggable?: DraggableProvidedDragHandleProps;
}

interface AvailableColumn {
  type: DeckGridItem["type"];
  title: string;
  icon: JSX.Element;
  description: string;
}

const CurrentThreadsDescriptionIndex = Math.floor(Math.random() * 3) + 1;

export const DeckAddColumn = ({ id, draggable, deckKey }: Props) => {
  const { activeUser } = useMappedStore();
  const { add, deleteColumn } = useContext(DeckGridContext);

  const availableColumns: AvailableColumn[] = [
    {
      type: "u",
      title: _t("decks.columns.user"),
      icon: userIconSvg,
      description: _t("decks.columns.user-description")
    },
    {
      type: "co",
      title: _t("decks.columns.community"),
      icon: communityIconSvg,
      description: _t("decks.columns.community-description")
    },
    {
      type: "th",
      title: _t("decks.columns.threads"),
      icon: threadSvg,
      description: _t(`decks.columns.threads-description${CurrentThreadsDescriptionIndex}`)
    },
    {
      type: "w",
      title: _t("decks.columns.wallet"),
      icon: walletIconSvg,
      description: _t("decks.columns.wallet-description")
    },
    {
      type: "n",
      title: _t("decks.columns.notifications"),
      icon: notificationsIconSvg,
      description: _t("decks.columns.notifications-description")
    },
    {
      type: "tr",
      title: _t("decks.columns.trending"),
      icon: trendingIconSvg,
      description: _t("decks.columns.trending-description")
    },
    {
      type: "to",
      title: _t("decks.columns.topics"),
      icon: topicsIconSvg,
      description: _t("decks.columns.topics-description")
    },
    {
      type: "msf",
      title: _t("decks.columns.market-swap-form"),
      icon: swapFormSvg,
      description: _t("decks.columns.msf-description")
    },
    {
      type: "s",
      title: _t("decks.columns.search"),
      icon: searchIconSvg,
      description: _t("decks.columns.search-description")
    },
    {
      type: "faq",
      title: _t("decks.columns.faq"),
      icon: faqIconSvg,
      description: _t("decks.columns.faq-description")
    }
  ];
  const typesWithoutSettings = ["tr", "to", "msf", "faq"];

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
          availableColumns.find((col) => col.type === selectedType)?.title ?? _t("decks.add-column")
        }
        prefix={
          selectedType ? (
            <Button
              variant="link"
              className="p-0"
              onClick={() => {
                setStep("select");
                setSelectedType(null);
              }}
            >
              {arrowLeftSvg}
            </Button>
          ) : (
            <></>
          )
        }
      />
      <div className="deck-content">
        {step === "select" ? (
          <>
            <div className="subtitle p-3">Choose one</div>
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
