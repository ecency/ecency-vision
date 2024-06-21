import { CommunityDeckGridItem, DeckGridItem, UserDeckGridItem } from "../types";
import i18next from "i18next";

export const communityTitles: Record<string, string> = {
  trending: i18next.t("decks.columns.trending"),
  created: i18next.t("decks.columns.new"),
  hot: i18next.t("decks.columns.hot"),
  payout: i18next.t("decks.columns.payouts"),
  muted: i18next.t("decks.columns.muted")
};

export const notificationsTitles: Record<string, string> = {
  all: "",
  rvotes: i18next.t("decks.columns.votes"),
  mentions: i18next.t("decks.columns.mentions"),
  nfavorites: i18next.t("decks.columns.favourites"),
  nbookmarks: i18next.t("decks.columns.bookmarks"),
  follows: i18next.t("decks.columns.follows"),
  replies: i18next.t("decks.columns.replies"),
  reblogs: i18next.t("decks.columns.reblogs"),
  transfers: i18next.t("decks.columns.transfers"),
  delegations: i18next.t("decks.columns.delegations")
};

export const userTitles: Record<string, string> = {
  posts: i18next.t("decks.columns.posts"),
  blog: i18next.t("decks.columns.blogs"),
  comments: i18next.t("decks.columns.comments"),
  replies: i18next.t("decks.columns.replies")
};

export const walletTitles: Record<string, string> = {
  all: i18next.t("decks.columns.all-history"),
  transfers: i18next.t("decks.columns.transfers"),
  "market-orders": i18next.t("decks.columns.market-orders"),
  interests: i18next.t("decks.columns.interests"),
  "stake-operations": i18next.t("decks.columns.stake-operations"),
  rewards: i18next.t("decks.columns.rewards")
};

export function getColumnTitle(
  type: DeckGridItem["type"],
  settings: DeckGridItem["settings"]
): string {
  const getSubtype = (subType: string, titles: Record<string, string>) =>
    subType ? " – " + titles[subType] : "";

  switch (type) {
    case "co":
      return `${i18next.t("decks.columns.community")}${getSubtype(
        (settings as CommunityDeckGridItem["settings"]).contentType,
        communityTitles
      )}`;
    case "cu":
      return "Custom";
    case "n":
      return `${i18next.t("decks.columns.notifications")}${getSubtype(
        (settings as UserDeckGridItem["settings"]).contentType,
        notificationsTitles
      )}`;
    case "s":
      return "Search";
    case "u":
      return `${i18next.t("decks.columns.user")}${getSubtype(
        (settings as UserDeckGridItem["settings"]).contentType,
        userTitles
      )}`;
    case "w":
      return `${i18next.t("decks.columns.wallet")}${getSubtype(
        (settings as UserDeckGridItem["settings"]).contentType,
        walletTitles
      )}`;
    case "th":
      return i18next.t("decks.columns.threads");
    case "wb":
      return `${i18next.t("decks.columns.wallet")} – ${i18next.t("decks.columns.balance")}`;
    case "wn":
      return i18next.t("decks.columns.updates");
    default:
      return "";
  }
}
