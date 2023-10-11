import React, { useState } from "react";
import { MarketAdvancedModeWidgetHeader } from "./market-advanced-mode-widget-header";
import { MenuItem } from "../dropdown";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { History } from "history";
import { _t } from "../../i18n";

interface Props {
  className?: string;
  type: Widget;
  title?: string | JSX.Element;
  children: JSX.Element;
  headerOptions?: JSX.Element;
  widgetTypeChanged: (newType: Widget) => void;
  history: History;
  additionalSettings?: JSX.Element;
  settingsClassName?: string;
}

export const MarketAdvancedModeWidget = ({
  children,
  history,
  type,
  title,
  headerOptions,
  className,
  widgetTypeChanged,
  additionalSettings,
  settingsClassName
}: Props) => {
  const [expandedHeader, setExpandedHeader] = useState(false);

  const getLabel = (type: Widget): string => {
    switch (type) {
      case Widget.History:
        return _t("market.advanced.history");
      case Widget.OpenOrders:
        return _t("market.advanced.open-orders");
      case Widget.Pairs:
        return _t("market.advanced.pairs");
      case Widget.TradingForm:
        return _t("market.advanced.form");
      case Widget.TradingView:
        return _t("market.advanced.chart");
      case Widget.Stake:
        return _t("market.advanced.stake");
      default:
        return "";
    }
  };

  const dropdownItems: MenuItem[] = Object.values(Widget)
    .filter((t) => t !== Widget.Pairs)
    .map((t) => ({
      label: getLabel(t),
      onClick: () => widgetTypeChanged(t),
      selected: type === t
    }));

  return (
    <div
      className={
        "market-advanced-mode-widget border border-[--border-color] " +
        (expandedHeader ? "expanded-header " : "") +
        className
      }
    >
      <MarketAdvancedModeWidgetHeader
        expandedHeader={expandedHeader}
        setExpandedHeader={setExpandedHeader}
        title={title}
        headerOptions={headerOptions}
        settings={
          additionalSettings ? (
            <div className={"p-3 " + settingsClassName}>{additionalSettings}</div>
          ) : undefined
        }
      />
      {children}
    </div>
  );
};
