import React, { useEffect, useState } from "react";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { refreshSvg } from "@ui/svg";
import i18next from "i18next";

interface Props {
  onReload: () => void;
  isReloading: boolean;
  updateDataInterval: number;
}

export const DeckHeaderReloading = ({ isReloading, onReload, updateDataInterval }: Props) => {
  const [intervalLink, setIntervalLink] = useState<any>(null);

  useEffect(() => {
    if (intervalLink) {
      clearInterval(intervalLink);
    }
    setIntervalLink(setInterval(onReload, updateDataInterval));
  }, [intervalLink, onReload, updateDataInterval]);

  return (
    <Button
      appearance="link"
      size="sm"
      onClick={onReload}
      disabled={isReloading}
      icon={isReloading ? <Spinner className="w-4 h-4" /> : refreshSvg}
      iconPlacement="left"
    >
      {i18next.t("decks.reload")}
    </Button>
  );
};