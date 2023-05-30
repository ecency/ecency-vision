import { DeckGridItem, DeckGrids } from "../types";
import * as uuid from "uuid";

export const DEFAULT_COLUMNS: DeckGridItem[] = [
  {
    id: uuid.v4(),
    key: 1,
    type: "u",
    settings: {
      username: "ecency",
      contentType: "posts",
      updateIntervalMs: 60000
    }
  },
  {
    id: uuid.v4(),
    key: 2,
    type: "ac",
    settings: {}
  }
];

export const DEFAULT_LAYOUT: DeckGrids = {
  decks: [
    {
      key: uuid.v4(),
      title: "Default",
      icon: "⭐️",
      storageType: "local",
      columns: DEFAULT_COLUMNS
    }
  ]
};
