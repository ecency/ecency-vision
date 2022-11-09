import { Layout, Widget } from "../types/layout.type";

export const DEFAULT_LAYOUT: Layout = {
  columns: [
    {
      size: "collapsed",
      rows: [{ widgetType: Widget.StakeSell }, { widgetType: Widget.StakeBuy }]
    },
    {
      size: "expanded",
      rows: [{ widgetType: Widget.TradingView }, { widgetType: Widget.TradingForm }]
    },
    {
      size: "collapsed",
      rows: [{ widgetType: Widget.Pairs }, { widgetType: Widget.History }]
    }
  ]
};
