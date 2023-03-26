interface BaseDeckGridItem {
  id: string;
  key: number;
  type: "u" | "ac" | "co" | "w" | "n" | "tr" | "to" | "s" | "cu";
  settings: Record<string, any>;
}

export interface ReloadableDeckGridItem extends BaseDeckGridItem {
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

export interface CommunityDeckGridItem extends ReloadableDeckGridItem {
  type: "co";
  settings: UserDeckGridItem["settings"] & {
    tag: string;
  };
}

export interface SearchDeckGridItem extends ReloadableDeckGridItem {
  type: "s";
  settings: ReloadableDeckGridItem["settings"] & {
    query: string;
  };
}

export type DeckGridItem =
  | BaseDeckGridItem
  | UserDeckGridItem
  | CommunityDeckGridItem
  | SearchDeckGridItem;
