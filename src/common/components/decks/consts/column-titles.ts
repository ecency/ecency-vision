import {
  CommunityDeckGridItem,
  DeckGridItem,
  SearchDeckGridItem,
  UserDeckGridItem
} from "../types";

export const communityTitles = {
  trending: "Trending",
  created: "New",
  hot: "Hot",
  payout: "Payouts",
  muted: "Muted"
};

export const notificationsTitles = {
  all: "",
  rvotes: "Votes",
  mentions: "Mentions",
  nfavorites: "Favourites",
  nbookmarks: "Bookmarks",
  follows: "Follows",
  replies: "Replies",
  reblogs: "Reblogs",
  transfers: "Transfers",
  delegations: "Delegations"
};

export const userTitles = {
  posts: "Posts",
  blog: "Blog",
  comments: "Comments",
  replies: "Replies"
};

export function getColumnTitle(
  type: DeckGridItem["type"],
  settings: DeckGridItem["settings"]
): string {
  const getSubtype = (subType: string, titles: Record<string, string>) =>
    subType ? " – " + titles[subType] : "";

  switch (type) {
    case "co":
      return `Community${getSubtype(
        (settings as CommunityDeckGridItem["settings"]).contentType,
        communityTitles
      )}`;
    case "cu":
      return "Custom";
    case "n":
      return `Notifications${getSubtype(
        (settings as UserDeckGridItem["settings"]).contentType,
        notificationsTitles
      )}`;
    case "s":
      return "Search";
    case "u":
      return `User${getSubtype(
        (settings as UserDeckGridItem["settings"]).contentType,
        userTitles
      )}`;
    case "w":
      return "Wallet";
    default:
      return "";
  }
}
