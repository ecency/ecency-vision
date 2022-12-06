import { MarketAdvancedModeWidget } from "./market-advanced-mode-widget";
import React, { useEffect, useState } from "react";
import { _t } from "../../i18n";
import { HiveBarter } from "../hive-barter";
import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";
import { DayChange } from "../../pages/market/advanced-mode/types/day-change.type";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { History } from "history";

interface Props {
  history: History;
  activeUser: ActiveUser | null;
  buyBalance: string;
  sellBalance: string;
  dayChange: DayChange;
  global: Global;
  price: number;
}

export const TradingFormWidget = ({
  activeUser,
  buyBalance,
  sellBalance,
  dayChange,
  global,
  price,
  history
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [buyPeakValue, setBuyPeakValue] = useState(0);
  const [sellPeakValue, setSellPeakValue] = useState(0);

  useEffect(() => {
    setBuyPeakValue(price);
    setSellPeakValue(price);
  }, [price]);

  return (
    <MarketAdvancedModeWidget
      type={Widget.TradingForm}
      history={history}
      title={_t("market.advanced.form")}
      children={
        <div>
          {activeUser ? (
            <div className="d-flex">
              <HiveBarter
                isInline={true}
                type={1}
                available={buyBalance}
                username={activeUser.username}
                peakValue={buyPeakValue}
                basePeakValue={dayChange.low}
                loading={loading}
                activeUser={activeUser}
                global={global}
                onClickPeakValue={(v) => {
                  setBuyPeakValue(+v);
                }}
                onTransactionSuccess={() => {}}
              />
              <HiveBarter
                isInline={true}
                type={2}
                available={sellBalance}
                username={activeUser.username}
                peakValue={sellPeakValue}
                basePeakValue={dayChange.high}
                loading={loading}
                activeUser={activeUser}
                global={global}
                onClickPeakValue={(v) => {
                  setSellPeakValue(+v);
                }}
                onTransactionSuccess={() => {}}
              />
            </div>
          ) : (
            <></>
          )}
        </div>
      }
      widgetTypeChanged={() => {}}
    />
  );
};
