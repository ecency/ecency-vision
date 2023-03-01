export enum Widget {
  TradingView = "tv",
  History = "hs",
  TradingForm = "tf",
  Stake = "st",
  Pairs = "pr",
  OpenOrders = "oo"
}

export type ColumnSize = "collapsed" | "expanded";

export interface LayoutColumn {
  widgetType?: Widget;
  size: ColumnSize;
  uuid: string;
  rows: LayoutRow[];
}

export interface LayoutRow {
  columns: LayoutColumn[];
}

export interface Layout {
  rows: LayoutRow[];
}
