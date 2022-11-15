export enum Widget {
  TradingView,
  History,
  TradingForm,
  Stake,
  Pairs
}

export type ColumnSize = "collapsed" | "expanded";

export interface LayoutRow {
  widgetType: Widget;
}

export interface LayoutColumn {
  rows: LayoutRow[];
  size: ColumnSize;
}

export interface Layout {
  columns: LayoutColumn[];
}
