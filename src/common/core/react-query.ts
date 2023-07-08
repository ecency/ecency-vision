import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
});

export enum QueryIdentifiers {
  COMMUNITY_THREADS = "community-threads",
  THREADS = "threads",
  ENTRY = "entry",
  DELETED_ENTRY = "deleted-entry",
  ENTRY_PIN_TRACK = "entry-pin-track",
  COMMUNITY = "community",
  COMMUNITY_RANKED_POSTS = "community-ranked-posts",
  DECK_USER = "deck-user",
  DECK_COMMUNITY = "deck-community"
}
