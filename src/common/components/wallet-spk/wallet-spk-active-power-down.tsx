import React from "react";
import { _t } from "../../i18n";
import { Button } from "@ui/button";

interface Props {
  headBlock: number;
  powerUpList: string[];
  onStop: () => void;
}

export const WalletSpkActivePowerDown = ({ headBlock, powerUpList, onStop }: Props) => {
  const when = (list: string[]) => {
    if (!list.length) {
      return "";
    }

    const seconds = (parseInt(list[0]) - headBlock) * 3;
    let interval = Math.floor(seconds / 86400);

    if (interval >= 1) {
      return interval + ` day${interval > 1 ? "s" : ""}`;
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + ` hour${interval > 1 ? "s" : ""}`;
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} minute${interval > 1 ? "s" : ""}`;
    }
    return Math.floor(seconds) + " seconds";
  };
  return (
    <>
      {when(powerUpList) ? (
        <div className="font-bold flex items-center">
          <span>
            {_t("wallet.spk.power-down.in-progress", {
              date: when(powerUpList),
              count: powerUpList.length
            })}
          </span>
          <Button size="sm" className="ml-2" appearance="danger" outline={true} onClick={onStop}>
            {_t("g.stop")}
          </Button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
