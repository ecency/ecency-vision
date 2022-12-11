import { Layout, Widget } from "../types/layout.type";
import { v4 } from "uuid";

export const DEFAULT_LAYOUT: Layout = {
  rows: [
    {
      columns: [
        {
          widgetType: Widget.Stake,
          size: "collapsed",
          rows: [],
          uuid: v4()
        },
        {
          size: "expanded",
          uuid: v4(),
          rows: [
            {
              columns: [
                {
                  widgetType: Widget.TradingView,
                  size: "expanded",
                  rows: [],
                  uuid: v4()
                }
              ]
            },
            {
              columns: [
                {
                  widgetType: Widget.TradingForm,
                  size: "expanded",
                  rows: [],
                  uuid: v4()
                }
              ]
            }
          ]
        },
        {
          size: "collapsed",
          uuid: v4(),
          rows: [
            {
              columns: [
                {
                  widgetType: Widget.History,
                  size: "expanded",
                  rows: [],
                  uuid: v4()
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
          rows: [],
          uuid: v4()
        }
      ]
    }
  ]
};
