export enum EntryFilter {
  trending = "trending",
  hot = "hot",
  created = "created",
  payout = "payout",
  payout_comments = "payout_comments",
  muted = "muted",
  controversial = "controversial",
  rising = "rising",
  promoted = "promoted"
}

export enum ProfileFilter {
  blog = "blog",
  posts = "posts",
  comments = "comments",
  replies = "replies"
}

// TODO: Find a proper way to merge EntryFilter and ProfileFilter
export enum AllFilter {
  trending = "trending",
  hot = "hot",
  created = "created",
  payout = "payout",
  payout_comments = "payout_comments",
  muted = "muted", // To see muted accounts
  blog = "blog", // This might be deleted
  posts = "posts",
  comments = "comments",
  replies = "replies",
  communities = "communities",
  feed = "feed",
  no_reblog = "no_reblog",
  controversial = "controversial",
  rising = "rising",
  promoted = "promoted"
}
