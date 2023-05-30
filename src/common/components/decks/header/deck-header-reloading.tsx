import { _t } from "../../../i18n";
import { refreshSvg } from "../../../img/svg";
import { Button } from "react-bootstrap";
import React, { useEffect, useState } from "react";

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
  }, [updateDataInterval]);

  return (
    <Button
      variant="link"
      size="sm"
      className="d-flex align-items-center"
      onClick={onReload}
      disabled={isReloading}
    >
      {isReloading ? (
        <div className="spinner-border spinner-border-sm text-secondary mr-1" role="status">
          <span className="sr-only">{_t("g.loading")}</span>
        </div>
      ) : (
        <div className="deck-options-icon d-flex mr-1">{refreshSvg}</div>
      )}
      <span>{_t("decks.reload")}</span>
    </Button>
  );
};
