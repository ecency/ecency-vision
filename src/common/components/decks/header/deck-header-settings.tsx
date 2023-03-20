import React from "react";
import { DeckHeaderUpdateIntervalSettings } from "./deck-header-update-interval-settings";
import { DeckHeaderWalletSettings } from "./deck-header-wallet-settings";
import { connect } from "react-redux";
import { pageMapDispatchToProps, pageMapStateToProps } from "../../../pages/common";
import { DeckState } from "../../../store/deck/types";
import { _t } from "../../../i18n";
import { DeckHeaderNotificationsSettings } from "./deck-header-notifications-settings";

interface Props {
  updateInterval?: number;
  username: string;
  title: string;
  setDeckUpdateInterval: Function;
  setDeckDataFilters: Function;
  fetchDeckData: Function;
  deck: DeckState;
}

const DeckHeaderSettingsComponent = ({
  updateInterval,
  title,
  username,
  setDeckUpdateInterval,
  setDeckDataFilters,
  deck,
  fetchDeckData
}: Props) => {
  const getWalletSettings = () => {
    const isWalletType = title.toLocaleLowerCase().includes(_t("decks.wallet").toLocaleLowerCase());
    if (isWalletType) {
      const deckInstance = deck.items.find((d) => d.header.title === title);
      return (
        <DeckHeaderWalletSettings
          deck={deckInstance!!}
          title={title}
          username={username}
          setDeckDataFilters={setDeckDataFilters}
          fetchDeckData={fetchDeckData}
        />
      );
    } else {
      return <></>;
    }
  };

  const getNotificationsSettings = () => {
    const isNotificationsType = title
      .toLocaleLowerCase()
      .includes(_t("decks.notifications").toLocaleLowerCase());
    if (isNotificationsType) {
      const deckInstance = deck.items.find((d) => d.header.title === title);
      return (
        <DeckHeaderNotificationsSettings
          deck={deckInstance!!}
          title={title}
          username={username}
          setDeckDataFilters={setDeckDataFilters}
          fetchDeckData={fetchDeckData}
        />
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      {getWalletSettings()}
      {getNotificationsSettings()}
      {typeof updateInterval == "number" ? (
        <DeckHeaderUpdateIntervalSettings
          updateInterval={updateInterval}
          username={username}
          title={title}
          setDeckUpdateInterval={setDeckUpdateInterval}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export const DeckHeaderSettings = connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(DeckHeaderSettingsComponent);
