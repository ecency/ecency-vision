import {
  blogIconSvg,
  bookmarksIconSvg,
  commentsIconSvg,
  delegationsIconSvg,
  favouritesIconSvg,
  followsIconSvg,
  hotIconSvg,
  interestsIconSvg,
  marketOrdersIconSvg,
  mentionsIconSvg,
  mutedIconSvg,
  newIconSvg,
  payoutsIconSvg,
  postsIconSvg,
  reblogsIconSvg,
  repliesIconSvg,
  rewardIconSvg,
  stakeOperationsIconSvg,
  transfersIconSvg,
  trendingIconSvg,
  voteIconSvg,
  walletAllIconSvg
} from "../icons";

export const ICONS = {
  community: {
    trending: trendingIconSvg,
    hot: hotIconSvg,
    new: newIconSvg,
    payouts: payoutsIconSvg,
    muted: mutedIconSvg
  },
  notifications: {
    all: walletAllIconSvg,
    rvotes: voteIconSvg,
    mentions: mentionsIconSvg,
    nfavorites: favouritesIconSvg,
    nbookmarks: bookmarksIconSvg,
    follows: followsIconSvg,
    replies: repliesIconSvg,
    reblogs: reblogsIconSvg,
    transfers: transfersIconSvg,
    delegations: delegationsIconSvg
  },
  user: {
    blog: blogIconSvg,
    posts: postsIconSvg,
    comments: commentsIconSvg,
    replies: repliesIconSvg
  },
  wallet: {
    all: walletAllIconSvg,
    transfers: transfersIconSvg,
    "market-orders": marketOrdersIconSvg,
    interests: interestsIconSvg,
    "stake-operations": stakeOperationsIconSvg,
    rewards: rewardIconSvg
  }
};
