import { DeckHeader } from "../../header/deck-header";
import React, { useState } from "react";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { _t } from "../../../../i18n";
import { DeckGridItem } from "../../types";
import {
  arrowLeftSvg,
  communities,
  globalTrending,
  hot,
  magnify,
  notifications,
  person,
  wallet
} from "../../../../img/svg";
import "./_deck-add-column.scss";
import { DeckAddColumnTypeSettings } from "./deck-add-column-type-settings";
import { Button } from "react-bootstrap";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";

interface Props {
  onRemove: () => void;
  deckKey: number;
  draggable?: DraggableProvidedDragHandleProps;
}

interface AvailableColumn {
  type: DeckGridItem["type"];
  title: string;
  icon: JSX.Element;
  description: string;
}

export const DeckAddColumn = ({ onRemove, draggable, deckKey }: Props) => {
  const { activeUser } = useMappedStore();

  const availableColumns: AvailableColumn[] = [
    {
      type: "u",
      title: "User",
      icon: person,
      description: "Find a profile and see what they're been up to."
    },
    {
      type: "co",
      title: "Community",
      icon: communities,
      description: "Find a community and follow their activity."
    },
    {
      type: "w",
      title: "Wallet",
      icon: wallet,
      description: "Track people's transactions and funds."
    },
    {
      type: "n",
      title: "Notifications",
      icon: notifications,
      description: "Follow any people activity."
    },
    {
      type: "tr",
      title: "Trending",
      icon: globalTrending,
      description: "Explore trending posts at this moment."
    },
    {
      type: "to",
      title: "Topics",
      icon: hot,
      description: "See the most popular topics and explore content."
    },
    {
      type: "s",
      title: "Search",
      icon: magnify,
      description: "Explore specific posts based on your search query."
    }
  ];

  const [step, setStep] = useState<"select" | "setup">("select");
  const [selectedType, setSelectedType] = useState<DeckGridItem["type"] | null>(null);

  return (
    <div className="deck deck-add-column native-scroll">
      <DeckHeader
        draggable={draggable}
        primary={true}
        sticky={true}
        account={activeUser?.username ?? ""}
        onRemove={onRemove}
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
                  setSelectedType(type);
                  setStep("setup");
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
