import { DeckGridItem } from "../../types";
import React from "react";
import { DeckAddColumnUserSettings } from "./index";
import { DeckAddColumnCommunitySettings } from "./deck-add-column-community-settings";
import { DeckAddColumnWalletSettings } from "./deck-add-column-wallet-settings";
import { DeckAddColumnNotificationsSettings } from "./deck-add-column-notifications-settings";
import { SettingsProps } from "./common";
import { DeckAddColumnSearchSettings } from "./deck-add-column-search-settings";
import { DeckAddColumnThreadSettings } from "./deck-add-column-thread-settings";

interface Props extends SettingsProps {
  type: DeckGridItem["type"];
}

export const DeckAddColumnTypeSettings = ({ type, deckKey }: Props) => {
  return (
    <>
      {type === "u" ? <DeckAddColumnUserSettings deckKey={deckKey} /> : <></>}
      {type === "co" ? <DeckAddColumnCommunitySettings deckKey={deckKey} /> : <></>}
      {type === "w" ? <DeckAddColumnWalletSettings deckKey={deckKey} /> : <></>}
      {type === "n" ? <DeckAddColumnNotificationsSettings deckKey={deckKey} /> : <></>}
      {type === "s" ? <DeckAddColumnSearchSettings deckKey={deckKey} /> : <></>}
      {type === "th" ? <DeckAddColumnThreadSettings deckKey={deckKey} /> : <></>}
    </>
  );
};
