interface BaseDeckGridItem {
  key: number;
  type: "u" | "ac" | "co" | "w" | "n" | "tr" | "to" | "s" | "cu";
  settings: unknown;
}

export interface UserDeckGridItem extends BaseDeckGridItem {
  type: "u";
  settings: {
    username: string;
    contentType: string;
  };
}

export type DeckGridItem = BaseDeckGridItem | UserDeckGridItem;
