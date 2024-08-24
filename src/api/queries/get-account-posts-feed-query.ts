import { getAccountPostsQuery } from "@/api/queries/get-account-posts-query";
import { getControversialRisingQuery } from "@/api/queries/get-controversial-rising-query";
import { getPostsRankedQuery } from "@/api/queries/get-posts-ranked-query";
import { InfiniteData } from "@tanstack/react-query";
import { Entry, SearchResponse } from "@/entities";

export async function prefetchGetPostsFeedQuery(
  what: string,
  tag = "",
  limit = 20,
  observer?: string
): Promise<InfiniteData<Entry[] | SearchResponse> | undefined> {
  const isControversial = ["rising", "controversial"].includes(what);
  const isUser = tag.startsWith("@");

  const isAccountPosts = isUser && !isControversial;
  const isControversialPosts = !isUser && isControversial;

  if (isAccountPosts) {
    return getAccountPostsQuery(tag.replace("@", ""), what, limit, observer ?? "", true).prefetch();
  }

  if (isControversialPosts) {
    return getControversialRisingQuery(what, tag).prefetch();
  }

  return getPostsRankedQuery(what, tag, limit, observer ?? "").prefetch();
}

export function getPostsFeedQueryData(what: string, tag: string, limit = 20, observer?: string) {
  const isControversial = ["rising", "controversial"].includes(what);
  const isUser = tag.startsWith("@");

  const isAccountPosts = isUser && !isControversial;
  const isControversialPosts = !isUser && isControversial;

  if (isAccountPosts) {
    return getAccountPostsQuery(tag.replace("@", ""), what, limit, observer ?? "", true).getData();
  }

  if (isControversialPosts) {
    return getControversialRisingQuery(what, tag).getData();
  }

  return getPostsRankedQuery(what, tag, limit, observer ?? "").getData();
}

export function usePostsFeedQuery(what: string, tag: string, limit = 20) {
  const isControversial = ["rising", "controversial"].includes(what);
  const isUser = tag.startsWith("@");

  const isAccountPosts = isUser && !isControversial;
  const isControversialPosts = !isUser && isControversial;

  if (isAccountPosts) {
    return getAccountPostsQuery(tag.replace("@", ""), what, limit, "", true).useClientQuery();
  }

  if (isControversialPosts) {
    return getControversialRisingQuery(what, tag).useClientQuery();
  }

  return getPostsRankedQuery(what, tag, limit, "").useClientQuery();
}
