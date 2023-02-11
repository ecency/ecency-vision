import React, { ChangeEvent, useState } from "react";
import { _t } from "../../i18n";
import { Button } from "react-bootstrap";
import { allStakeSvg, buyStakeSvg, sellStakeSvg } from "../../img/svg";

export enum StakeWidgetViewType {
  All = "all",
  Sell = "sell",
  Buy = "buy"
}

interface Props {
  viewType: StakeWidgetViewType;
  fraction: number;
  onFractionChange: (value: number) => void;
  onViewTypeChange: (value: StakeWidgetViewType) => void;
}

export const StakeWidgetHeaderOptions = ({
  fraction,
  onFractionChange,
  viewType,
  onViewTypeChange
}: Props) => {
  const [fractionValue, setFractionValue] = useState(fraction);

  return (
    <div className="stake-widget-header-options flex-wrap">
      <div className="stake-widget-header-view-type">
        <Button
          variant={"link"}
          size={"sm"}
          className={viewType === StakeWidgetViewType.All ? "active" : ""}
          onClick={() => onViewTypeChange(StakeWidgetViewType.All)}
        >
          {allStakeSvg}
        </Button>
        <Button
          variant={"link"}
          size={"sm"}
          className={viewType === StakeWidgetViewType.Buy ? "active" : ""}
          onClick={() => onViewTypeChange(StakeWidgetViewType.Buy)}
        >
          {buyStakeSvg}
        </Button>
        <Button
          variant={"link"}
          size={"sm"}
          className={viewType === StakeWidgetViewType.Sell ? "active" : ""}
          onClick={() => onViewTypeChange(StakeWidgetViewType.Sell)}
        >
          {sellStakeSvg}
        </Button>
      </div>

      <select
        placeholder={_t("wallet.spk.delegate.node-operator-placeholder")}
        className="form-control"
        value={fractionValue}
        onChange={(event: ChangeEvent<any>) => {
          setFractionValue(+event.target.value);
          onFractionChange(+event.target.value);
        }}
      >
        <option value="0.00001">0.00001</option>
        <option value="0.0001">0.0001</option>
        <option value="0.001">0.001</option>
        <option value="0.01">0.01</option>
        <option value="0.1">0.1</option>
      </select>
    </div>
  );
};
