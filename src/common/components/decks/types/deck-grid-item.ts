interface BaseDeckGridItem {
  id: string;
  key: number;
  type: "u" | "ac" | "co" | "w" | "n" | "tr" | "to" | "s" | "cu";
  settings: unknown;
}

interface ReloadableDeckGridItem extends BaseDeckGridItem {
  settings: {
    updateIntervalMs: number;
  };
}

export interface UserDeckGridItem extends ReloadableDeckGridItem {
  type: "u";
  settings: ReloadableDeckGridItem["settings"] & {
    username: string;
    contentType: string;
  };
}

export type DeckGridItem = BaseDeckGridItem | UserDeckGridItem;
