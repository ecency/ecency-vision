import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export enum QueryIdentifiers {
  COMMUNITY_THREADS = "community-threads",
  THREADS = "threads",
  ENTRY = "entry"
}
