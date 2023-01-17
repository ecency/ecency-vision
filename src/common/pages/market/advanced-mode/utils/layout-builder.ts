import { Layout, LayoutColumn, LayoutRow, Widget } from "../types/layout.type";

function iterateOverRow(
  row: LayoutRow,
  uuid: string,
  previousWidget: Widget | undefined,
  newWidgetType: Widget
): void {
  return row.columns.forEach((col) =>
    updateColumnWidgetType(col, uuid, previousWidget, newWidgetType)
  );
}

function updateColumnWidgetType(
  column: LayoutColumn,
  uuid: string,
  previousType: Widget | undefined,
  newWidgetType: Widget
) {
  if (column.rows.length > 0) {
    return column.rows.forEach((row) => iterateOverRow(row, uuid, previousType, newWidgetType));
  }

  if (column.uuid === uuid && column.widgetType === previousType) {
    column.widgetType = newWidgetType;
  }

  return column.uuid === uuid && column.widgetType === previousType ? column : null;
}

export function updateWidgetType(
  layout: Layout,
  uuid: string,
  previousWidgetType: Widget | undefined,
  newWidgetType: Widget
) {
  const layoutCopy = JSON.parse(JSON.stringify(layout)) as Layout;
  layoutCopy.rows.forEach((row) => iterateOverRow(row, uuid, previousWidgetType, newWidgetType));
  return layoutCopy;
}
