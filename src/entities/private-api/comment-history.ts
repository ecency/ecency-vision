export interface CommentHistoryListItem {
  title: string;
  body: string;
  tags: string[];
  timestamp: string;
  v: number;
}

export interface CommentHistory {
  meta: {
    count: number;
  };
  list: CommentHistoryListItem[];
}
