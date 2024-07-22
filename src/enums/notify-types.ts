export enum NotifyTypes {
  VOTE = 1,
  MENTION = 2,
  FOLLOW = 3,
  COMMENT = 4,
  RE_BLOG = 5,
  TRANSFERS = 6,
  FAVORITES = 13,
  BOOKMARKS = 15,
  ALLOW_NOTIFY = "ALLOW_NOTIFY"
}

export const ALL_NOTIFY_TYPES = [
  NotifyTypes.VOTE,
  NotifyTypes.MENTION,
  NotifyTypes.FOLLOW,
  NotifyTypes.COMMENT,
  NotifyTypes.RE_BLOG,
  NotifyTypes.TRANSFERS,
  NotifyTypes.FAVORITES,
  NotifyTypes.BOOKMARKS
] as const;

export enum NotificationViewType {
  ALL = "All",
  UNREAD = "Unread",
  READ = "Read"
}
