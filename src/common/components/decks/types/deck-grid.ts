import { DeckGridItem } from "./deck-grid-item";

export interface DeckGrid {
  key: string;
  title: string;
  icon?: string;
  columns: DeckGridItem[];
  storageType: "account" | "local";
}

export interface DeckGrids {
  decks: DeckGrid[];
}
