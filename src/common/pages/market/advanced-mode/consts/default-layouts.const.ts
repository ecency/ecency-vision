import { Layout, Widget } from "../types/layout.type";

export const DEFAULT_LAYOUT: Layout = {
  rows: [
    {
      columns: [
        {
          widgetType: Widget.Stake,
          size: "collapsed",
          rows: []
        },
        {
          size: "expanded",
          rows: [
            {
              columns: [
                {
                  widgetType: Widget.TradingView,
                  size: "expanded",
                  rows: []
                }
              ]
            },
            {
              columns: [
                {
                  widgetType: Widget.TradingForm,
                  size: "expanded",
                  rows: []
                }
              ]
            }
          ]
        },
        {
          size: "collapsed",
          rows: [
            {
              columns: [
                {
                  widgetType: Widget.History,
                  size: "expanded",
                  rows: []
                }
              ]
            }
          ]
        }
      ]
    },
    {
      columns: [
        {
          widgetType: Widget.OpenOrders,
          size: "expanded",
          rows: []
        }
      ]
    }
  ]
};
