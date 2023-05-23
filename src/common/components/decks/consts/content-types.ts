import { _t } from "../../../i18n";

export const COMMUNITY_CONTENT_TYPES = [
  { title: _t("decks.columns.trending"), type: "trending" },
  { title: _t("decks.columns.hot"), type: "hot" },
  {
    title: _t("decks.columns.new"),
    type: "created"
  },
  {
    title: _t("decks.columns.payouts"),
    type: "payout"
  },
  {
    title: _t("decks.columns.muted"),
    type: "muted"
  }
];

export const USER_CONTENT_TYPES = [
  { title: _t("decks.columns.blogs"), type: "blog" },
  { title: _t("decks.columns.posts"), type: "posts" },
  {
    title: _t("decks.columns.comments"),
    type: "comments"
  },
  {
    title: _t("decks.columns.replies"),
    type: "replies"
  }
];

export const WALLET_CONTENT_TYPES = [
  { title: _t("decks.columns.all-history"), type: "all" },
  { title: _t("decks.columns.transfers"), type: "transfers" },
  {
    title: _t("decks.columns.market-orders"),
    type: "market-orders"
  },
  {
    title: _t("decks.columns.interests"),
    type: "interests"
  },
  {
    title: _t("decks.columns.stake-operations"),
    type: "stake-operations"
  },
  {
    title: _t("decks.columns.rewards"),
    type: "rewards"
  }
];

export const NOTIFICATION_CONTENT_TYPES = [
  { title: _t("decks.columns.all"), type: "all" },
  { title: _t("decks.columns.votes"), type: "rvotes" },
  {
    title: _t("decks.columns.mentions"),
    type: "mentions"
  },
  {
    title: _t("decks.columns.favourites"),
    type: "nfavorites"
  },
  {
    title: _t("decks.columns.bookmarks"),
    type: "nbookmarks"
  },
  {
    title: _t("decks.columns.follows"),
    type: "follows"
  },
  {
    title: _t("decks.columns.replies"),
    type: "replies"
  },
  {
    title: _t("decks.columns.reblogs"),
    type: "reblogs"
  },
  {
    title: _t("decks.columns.transfers"),
    type: "transfers"
  },
  {
    title: _t("decks.columns.delegations"),
    type: "delegations"
  }
];
