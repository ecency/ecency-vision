import React, { useEffect, useState } from "react";
import { MarketMode } from "./market-mode";
import { _t } from "../../i18n";
import { ButtonGroup } from "@ui/button-group";

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
      labels={[_t("market.mode-swap"), _t("market.mode-limit"), _t("market.mode-advanced")]}
      setSelected={(i) => {
        switch (i) {
          case 0:
            onSelect(MarketMode.SWAP);
            window.location.hash = "swap";
            break;
          case 1:
            onSelect(MarketMode.LIMIT);
            window.location.hash = "limit";
            break;
          case 2:
            onSelect(MarketMode.ADVANCED);
            window.location.hash = "advanced";
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
