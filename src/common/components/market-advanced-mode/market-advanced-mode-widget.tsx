import React from "react";
import { MarketAdvancedModeWidgetHeader } from "./market-advanced-mode-widget-header";
import Dropdown, { MenuItem } from "../dropdown";
import { Widget } from "../../pages/market/advanced-mode/types/layout.type";
import { History } from "history";

interface Props {
  className?: string;
  type: Widget;
  title?: string;
  children: JSX.Element;
  headerOptions?: JSX.Element;
  widgetTypeChanged: (newType: Widget) => void;
  history: History;
}

export const MarketAdvancedModeWidget = ({
  children,
  history,
  type,
  title,
  headerOptions,
  className,
  widgetTypeChanged
}: Props) => {
  const getLabel = (type: Widget): string => {
    switch (type) {
      case Widget.History:
        return "History";
      case Widget.OpenOrders:
        return "Open orders";
      case Widget.Pairs:
        return "Pairs";
      case Widget.TradingForm:
        return "Trading form";
      case Widget.TradingView:
        return "Trading view";
      case Widget.Stake:
        return "Stake";
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
    <div className={"market-advanced-mode-widget border-left border-bottom " + className}>
      <MarketAdvancedModeWidgetHeader
        title={title}
        headerOptions={headerOptions}
        settings={
          <div className="p-3">
            <Dropdown float="none" label="Widget type" history={history} items={dropdownItems} />
          </div>
        }
      />
      {children}
    </div>
  );
};
