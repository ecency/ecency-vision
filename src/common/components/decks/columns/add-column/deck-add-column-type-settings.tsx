import { DeckGridItem } from "../../types";
import React from "react";
import { DeckAddColumnUserSettings } from "./index";
import { DeckAddColumnCommunitySettings } from "./deck-add-column-community-settings";
import { DeckAddColumnWalletSettings } from "./deck-add-column-wallet-settings";

interface SettingsProps {
  deckKey: number;
}

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
      {type === "w" ? <DeckAddColumnWalletSettings deckKey={deckKey} /> : <></>}
      {type === "n" ? <DeckAddColumnNotificationsSettings /> : <></>}
      {type === "s" ? <DeckAddColumnSearchSettings /> : <></>}
    </>
  );
};
