import i18next from "i18next";

export const COMMUNITY_CONTENT_TYPES = [
  { title: i18next.t("decks.columns.trending"), type: "trending" },
  { title: i18next.t("decks.columns.hot"), type: "hot" },
  {
    title: i18next.t("decks.columns.new"),
    type: "created"
  },
  {
    title: i18next.t("decks.columns.payouts"),
    type: "payout"
  },
  {
    title: i18next.t("decks.columns.muted"),
    type: "muted"
  }
];

export const USER_CONTENT_TYPES = [
  { title: i18next.t("decks.columns.feeds"), type: "feed" },
  { title: i18next.t("decks.columns.blogs"), type: "blog" },
  { title: i18next.t("decks.columns.posts"), type: "posts" },
  {
    title: i18next.t("decks.columns.comments"),
    type: "comments"
  },
  {
    title: i18next.t("decks.columns.replies"),
    type: "replies"
  }
];

export const WALLET_CONTENT_TYPES = [
  { title: i18next.t("decks.columns.balance"), type: "balance" },
  { title: i18next.t("decks.columns.all-history"), type: "all" },
  { title: i18next.t("decks.columns.transfers"), type: "transfers" },
  {
    title: i18next.t("decks.columns.market-orders"),
    type: "market-orders"
  },
  {
    title: i18next.t("decks.columns.interests"),
    type: "interests"
  },
  {
    title: i18next.t("decks.columns.stake-operations"),
    type: "stake-operations"
  },
  {
    title: i18next.t("decks.columns.rewards"),
    type: "rewards"
  }
];

export const NOTIFICATION_CONTENT_TYPES = [
  { title: i18next.t("decks.columns.all"), type: "all" },
  { title: i18next.t("decks.columns.votes"), type: "rvotes" },
  {
    title: i18next.t("decks.columns.mentions"),
    type: "mentions"
  },
  {
    title: i18next.t("decks.columns.favourites"),
    type: "nfavorites"
  },
  {
    title: i18next.t("decks.columns.bookmarks"),
    type: "nbookmarks"
  },
  {
    title: i18next.t("decks.columns.follows"),
    type: "follows"
  },
  {
    title: i18next.t("decks.columns.replies"),
    type: "replies"
  },
  {
    title: i18next.t("decks.columns.reblogs"),
    type: "reblogs"
  },
  {
    title: i18next.t("decks.columns.transfers"),
    type: "transfers"
  },
  {
    title: i18next.t("decks.columns.delegations"),
    type: "delegations"
  }
];
