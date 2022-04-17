import { IdentifiableDeckModel, SerializedDeckModel } from '../types';

export const serializeDecks = (items: IdentifiableDeckModel[]): SerializedDeckModel[] => items
  .map(({ header: { title }, createdAt, dataParams }) => ({
    header: { title },
    createdAt,
    dataParams,
  }));