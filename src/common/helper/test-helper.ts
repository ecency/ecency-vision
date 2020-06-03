import { State as GlobalState, Filter, Theme, ListStyle } from "../store/global/types";

export const globalInstance: GlobalState = {
  filter: Filter.hot,
  tag: "",
  theme: Theme.day,
  listStyle: ListStyle.row,
  intro: true,
  currency: "usd",
  currencyRate: 1,
  currencySymbol: "$",
};
