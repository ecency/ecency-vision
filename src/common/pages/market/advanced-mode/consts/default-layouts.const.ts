import { Layout, Widget } from "../types/layout.type";

export const DEFAULT_LAYOUT: Layout = {
  columns: [
    {
      size: "collapsed",
      rows: [{ widgetType: Widget.Stake }]
    },
    {
      size: "expanded",
      rows: [{ widgetType: Widget.TradingView }, { widgetType: Widget.TradingForm }]
    },
    {
      size: "collapsed",
      rows: [{ widgetType: Widget.History }]
    }
  ]
};
