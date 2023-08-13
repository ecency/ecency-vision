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
  NORMALIZED_ENTRY = "normalized-entry",
  DELETED_ENTRY = "deleted-entry",
  ENTRY_PIN_TRACK = "entry-pin-track",
  COMMUNITY = "community",
  COMMUNITY_RANKED_POSTS = "community-ranked-posts",
  DECK_USER = "deck-user",
  DECK_COMMUNITY = "deck-community",

  SWAP_FORM_CURRENCY_RATE = "swap-form-currency-rate",
  POINTS = "points",
  THREE_SPEAK_VIDEO_LIST = "three-speak-video-list",
  THREE_SPEAK_VIDEO_LIST_FILTERED = "three-speak-video-list-filtered",
  DRAFTS = "drafts",
  BY_DRAFT_ID = "by-draft-id"
}
