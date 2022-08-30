import { IdentifiableDeckModel, SerializedDeckModel } from "../types";

export const serializeDecks = (items: IdentifiableDeckModel[]): SerializedDeckModel[] =>
  items.map(({ header: { title, updateIntervalMs }, createdAt, dataParams, dataFilters }) => ({
    header: { title, updateIntervalMs },
    createdAt,
    dataParams,
    dataFilters
  }));
