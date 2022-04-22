import React from 'react'
import { DeckHeaderUpdateIntervalSettings } from './deck-header-update-interval-settings';

interface Props {
  updateInterval: number;
  username: string;
  title: string;
  setDeckUpdateInterval: Function;
}

export const DeckHeaderSettings = ({ updateInterval, title, username, setDeckUpdateInterval }: Props) => {
  return (
    <>
      <DeckHeaderUpdateIntervalSettings
        updateInterval={updateInterval}
        username={username}
        title={title}
        setDeckUpdateInterval={setDeckUpdateInterval}
      />
    </>
  );
}