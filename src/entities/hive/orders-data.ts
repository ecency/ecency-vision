import { OrdersDataItem } from "./orders-data-item";

export interface OrdersData {
  bids: OrdersDataItem[];
  asks: OrdersDataItem[];
  trading: OrdersDataItem[];
}
