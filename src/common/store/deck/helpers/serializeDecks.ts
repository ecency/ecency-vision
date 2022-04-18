import { IdentifiableDeckModel, SerializedDeckModel } from '../types';

export const serializeDecks = (items: IdentifiableDeckModel[]): SerializedDeckModel[] => items
  .map(({ header: { title, updateIntervalMs }, createdAt, dataParams }) => ({
    header: { title, updateIntervalMs },
    createdAt,
    dataParams,
  }));