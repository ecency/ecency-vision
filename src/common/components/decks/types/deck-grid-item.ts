/**
 * ac – Add a column
 * u – User
 * co – Community
 * w – Wallet
 * n – Notifications
 * tr – Trending
 * to – Topics
 * s – Search
 * cu – Custom
 */
export interface DeckGridItem {
  key: string;
  type: "ac" | "u" | "co" | "w" | "n" | "tr" | "to" | "s" | "cu";
  settings: any;
}
