import React from "react";
import { DeckHeaderUpdateIntervalSettings } from "./deck-header-update-interval-settings";

interface Props {
  updateInterval?: number;
  username: string;
  title: string;
  setDeckUpdateInterval: (v: number) => void;
}

export const DeckHeaderSettings = ({
  updateInterval,
  title,
  username,
  setDeckUpdateInterval
}: Props) => {
  return (
    <>
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
