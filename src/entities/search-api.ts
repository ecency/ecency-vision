import { EntryVote } from "@/entities/entries";

export interface SearchResult {
  id: number;
  title: string;
  title_marked: string | null;
  category: string;
  author: string;
  permlink: string;
  author_rep: number | string;
  author_reputation?: number | string;
  children: number;
  body: string;
  body_marked: string | null;
  img_url: string;
  created_at: string;
  created?: string;
  payout: number;
  total_votes: number;
  up_votes: number;
  tags: string[];
  json_metadata?: any;
  depth: number;
  app: string;
  active_votes?: EntryVote[];
  pending_payout_value?: string;
}

export interface SearchResponse {
  hits: number;
  results: SearchResult[];
  scroll_id?: string;
  took: number;
}

export interface FriendSearchResult {
  name: string;
  full_name: string;
  lastSeen: string;
  reputation: number;
}

export interface AccountSearchResult {
  name: string;
  full_name: string;
  about: string;
  reputation: number;
}

export interface TagSearchResult {
  tag: string;
  repeat: number;
}
