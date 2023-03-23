import { DeckGridItem } from "../../types";
import React from "react";
import { DeckAddColumnUserSettings } from "./index";
import { DeckAddColumnCommunitySettings } from "./deck-add-column-community-settings";

interface SettingsProps {
  deckKey: number;
}

const DeckAddColumnWalletSettings = () => {
  return <div className="deck-add-column-wallet-settings"></div>;
};

const DeckAddColumnNotificationsSettings = () => {
  return <div className="deck-add-column-notifications-settings"></div>;
};

const DeckAddColumnSearchSettings = () => {
  return <div className="deck-add-column-search-settings"></div>;
};

interface Props extends SettingsProps {
  type: DeckGridItem["type"];
}

export const DeckAddColumnTypeSettings = ({ type, deckKey }: Props) => {
  return (
    <>
      {type === "u" ? <DeckAddColumnUserSettings deckKey={deckKey} /> : <></>}
      {type === "co" ? <DeckAddColumnCommunitySettings deckKey={deckKey} /> : <></>}
      {type === "w" ? <DeckAddColumnWalletSettings /> : <></>}
      {type === "n" ? <DeckAddColumnNotificationsSettings /> : <></>}
      {type === "s" ? <DeckAddColumnSearchSettings /> : <></>}
    </>
  );
};
