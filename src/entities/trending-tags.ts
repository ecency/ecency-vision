export interface TrendingTag {
  comments: number;
  name: string;
  top_posts: number;
  total_payouts: string;
}

export interface TrendingTags {
  list: string[];
  loading: boolean;
  error: boolean;
}
