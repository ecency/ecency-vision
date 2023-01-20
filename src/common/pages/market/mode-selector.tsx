import React, { useEffect, useState } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
import { MarketMode } from "./market-mode";
import { _t } from "../../i18n";

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
    <ButtonGroup className={"d-flex mode-selector " + className ?? ""}>
      <Button
        active={rawMode === MarketMode.SWAP}
        onClick={() => {
          onSelect(MarketMode.SWAP);
          window.location.hash = "swap";
        }}
      >
        {_t("market.mode-swap")}
      </Button>
      <Button
        active={rawMode === MarketMode.LIMIT}
        onClick={() => {
          onSelect(MarketMode.LIMIT);
          window.location.hash = "limit";
        }}
      >
        {_t("market.mode-limit")}
      </Button>
      <Button
        active={rawMode === MarketMode.ADVANCED}
        onClick={() => {
          onSelect(MarketMode.ADVANCED);
          window.location.hash = "advanced";
        }}
      >
        {_t("market.mode-advanced")}
      </Button>
    </ButtonGroup>
  );
};
