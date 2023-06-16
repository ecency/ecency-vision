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
  COMMUNITY = "community",
  DECK_USER = "deck-user",
  DECK_COMMUNITY = "deck-community"
}
