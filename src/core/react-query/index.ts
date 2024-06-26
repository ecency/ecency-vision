import { isServer, QueryClient } from "@tanstack/react-query";

export enum QueryIdentifiers {
  COMMUNITY_THREADS = "community-threads",
  THREADS = "threads",
  ENTRY = "entry",
  ENTRY_THUMB = "entry-thumb",
  ENTRY_ACTIVE_VOTES = "entry-active-votes",
  NORMALIZED_ENTRY = "normalized-entry",
  DELETED_ENTRY = "deleted-entry",
  ENTRY_PIN_TRACK = "entry-pin-track",
  COMMUNITY = "community",
  COMMUNITY_SUBSCRIBERS = "community-subscribers",
  COMMUNITY_RANKED_POSTS = "community-ranked-posts",
  REWARDED_COMMUNITIES = "rewarded-communities",
  DECK_USER = "deck-user",
  DECK_COMMUNITY = "deck-community",
  ACCOUNT_NOTIFICATIONS = "account-notifications",
  SUBSCRIPTIONS = "subscriptions",
  COMMENT_HISTORY = "comment-history",
  PROMOTE_PRICE = "promote-price",
  SEARCH_PATH = "search-path",
  FOLLOW_COUNT = "follow-count",
  TRANSACTIONS = "transactions",
  VESTING_DELEGATIONS = "vesting-delegations",
  REBLOGS = "reblogs",
  MUTED_USERS = "muted-users",
  PROMOTED_ENTRIES = "promoted-entries",
  SEARCH_API = "search-api",
  SEARCH_ACCOUNT = "search-account",
  SEARCH_TOPICS = "search-topics",
  GET_IMAGES = "get-images",
  PROPOSAL_VOTES = "proposal-votes",
  SWAP_FORM_CURRENCY_RATE = "swap-form-currency-rate",
  POINTS = "points",
  THREE_SPEAK_VIDEO_LIST = "three-speak-video-list",
  THREE_SPEAK_VIDEO_LIST_FILTERED = "three-speak-video-list-filtered",
  DRAFTS = "drafts",
  BY_DRAFT_ID = "by-draft-id",
  FETCH_DISCUSSIONS = "fetch-discussions",
  FETCH_DISCUSSIONS_MAP = "fetch-discussions-map",
  FETCH_MUTED_USERS = "fetch-muted-users",
  GET_ACCOUNT_FULL = "get-account-full",
  GET_POSTS = "get-posts",
  GET_POSTS_CONTROVERSIAL_OR_RISING = "get-posts-control-or-rising",
  GET_POSTS_RANKED = "get-posts-ranked",
  GET_BOTS = "get-bots",
  GET_BOOST_PLUS_PRICES = "get-boost-plus-prices",
  GET_BOOST_PLUS_ACCOUNTS = "get-boost-plus-accounts",
  PROPOSALS = "proposals",
  POLL_DETAILS = "poll-details",
  GET_RELATIONSHIP_BETWEEN_ACCOUNTS = "get-relationship-between-accounts",
  COMMUNITIES = "communities",
  WITNESSES = "witnesses",
  GALLERY_IMAGES = "gallery-images",
  NOTIFICATIONS_UNREAD_COUNT = "notifications-unread-count",
  NOTIFICATIONS_SETTINGS = "notifications-settings",
  GET_ACCOUNTS = "get-accounts",
  FRAGMENTS = "fragments",
  FAVOURITES = "favourites",
  DYNAMIC_PROPS = "dynamic-props",
  BOOKMARKS = "bookmarks",
  POST_HEADER = "post-header",
  SCHEDULES = "schedules",
  TRENDING_TAGS = "trending-tags",
  DISCOVER_LEADERBOARD = "discover-leaderboard",
  DISCOVER_CURATION = "discover-curation",
  CONTRIBUTORS = "contributors",
  GIFS = "GIFS",
  NOTIFICATIONS = "NOTIFICATIONS",
  PROPOSAL = "proposal",
  GET_FRIENDS = "get-friends",
  GET_SEARCH_FRIENDS = "get-search-friends",
  RC_ACCOUNTS = "rc-accounts"
}

function makeQueryClient() {
  // Cache creates one single instance per request in a server side
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        // staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false
      }
    }
  });
}

let browserQueryClient: QueryClient | undefined = undefined;
let serverQueryClient: QueryClient | undefined = undefined;

export function initServerQueryClient() {
  serverQueryClient = makeQueryClient();
}

export function clearServerQueryClient() {
  serverQueryClient = undefined;
}

export function getQueryClient() {
  if (isServer) {
    // Server: make a new query client once request started \
    // And persist it during all render time
    if (!serverQueryClient) serverQueryClient = makeQueryClient();
    return serverQueryClient;
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export * from "./ecency-queries-manager";
