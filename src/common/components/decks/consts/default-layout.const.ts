import { DeckGrid } from "../types";
import uuid from "uuid";

export const DEFAULT_LAYOUT: DeckGrid = {
  columns: [
    {
      id: uuid.v4(),
      key: 1,
      type: "ac",
      settings: {}
    },
    {
      id: uuid.v4(),
      key: 2,
      type: "u",
      settings: {
        username: "ecency",
        contentType: "posts",
        updateIntervalMs: 60000
      }
    }
  ]
};
