import React, { useEffect, useState } from "react";
import { MarketMode } from "../_enums/market-mode";
import { ButtonGroup } from "@ui/button-group";
import i18next from "i18next";

interface Props {
  className?: string;
  mode: MarketMode;
  onSelect: (mode: MarketMode) => void;
}

export const ModeSelector = ({ mode, onSelect, className }: Props) => {
  const [rawMode, setRawMode] = useState("");

  useEffect(() => {
    setRawMode(mode);
  }, [mode]);

  return (
    <ButtonGroup
      className={className}
      labels={[
        i18next.t("market.mode-swap"),
        i18next.t("market.mode-limit"),
        i18next.t("market.mode-advanced")
      ]}
      setSelected={(i) => {
        switch (i) {
          case 0:
            onSelect(MarketMode.SWAP);
            break;
          case 1:
            onSelect(MarketMode.LIMIT);
            break;
          case 2:
            onSelect(MarketMode.ADVANCED);
            break;
          default:
            break;
        }
      }}
      selected={[MarketMode.SWAP, MarketMode.LIMIT, MarketMode.ADVANCED].findIndex(
        (i) => i === rawMode
      )}
    />
  );
};
