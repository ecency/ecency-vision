import { DeckGrid } from "../types";

export const DEFAULT_LAYOUT: DeckGrid = {
  columns: [
    {
      key: "1",
      type: "ac",
      settings: null
    },
    {
      key: "2",
      type: "u",
      settings: {
        username: "ecency",
        contentType: "posts"
      }
    }
  ]
};
