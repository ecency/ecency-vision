import {
  CommunityDeckGridItem,
  DeckGridItem,
  SearchDeckGridItem,
  UserDeckGridItem
} from "../types";
import { _t } from "../../../i18n";

export const communityTitles = {
  trending: _t("decks.columns.trending"),
  created: _t("decks.columns.new"),
  hot: _t("decks.columns.hot"),
  payout: _t("decks.columns.payouts"),
  muted: _t("decks.columns.muted")
};

export const notificationsTitles = {
  all: "",
  rvotes: _t("decks.columns.votes"),
  mentions: _t("decks.columns.mentions"),
  nfavorites: _t("decks.columns.favourites"),
  nbookmarks: _t("decks.columns.bookmarks"),
  follows: _t("decks.columns.follows"),
  replies: _t("decks.columns.replies"),
  reblogs: _t("decks.columns.reblogs"),
  transfers: _t("decks.columns.transfers"),
  delegations: _t("decks.columns.delegations")
};

export const userTitles = {
  posts: _t("decks.columns.posts"),
  blog: _t("decks.columns.blogs"),
  comments: _t("decks.columns.comments"),
  replies: _t("decks.columns.replies")
};

export const walletTitles = {
  all: _t("decks.columns.all-history"),
  transfers: _t("decks.columns.transfers"),
  "market-orders": _t("decks.columns.market-orders"),
  interests: _t("decks.columns.interests"),
  "stake-operations": _t("decks.columns.stake-operations"),
  rewards: _t("decks.columns.rewards")
};

export function getColumnTitle(
  type: DeckGridItem["type"],
  settings: DeckGridItem["settings"]
): string {
  const getSubtype = (subType: string, titles: Record<string, string>) =>
    subType ? " – " + titles[subType] : "";

  switch (type) {
    case "co":
      return `${_t("decks.columns.community")}${getSubtype(
        (settings as CommunityDeckGridItem["settings"]).contentType,
        communityTitles
      )}`;
    case "cu":
      return "Custom";
    case "n":
      return `${_t("decks.columns.notifications")}${getSubtype(
        (settings as UserDeckGridItem["settings"]).contentType,
        notificationsTitles
      )}`;
    case "s":
      return "Search";
    case "u":
      return `${_t("decks.columns.user")}${getSubtype(
        (settings as UserDeckGridItem["settings"]).contentType,
        userTitles
      )}`;
    case "w":
      return `${_t("decks.columns.wallet")}${getSubtype(
        (settings as UserDeckGridItem["settings"]).contentType,
        walletTitles
      )}`;
    case "th":
      return _t("decks.columns.threads");
    case "wb":
      return `${_t("decks.columns.wallet")} – ${_t("decks.columns.balance")}`;
    case "wn":
      return _t("decks.columns.updates");
    default:
      return "";
  }
}
