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
