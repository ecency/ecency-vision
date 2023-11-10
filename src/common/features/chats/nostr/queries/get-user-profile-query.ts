import { useNostrFetchQuery } from "../core";
import { Kind } from "../../../../../lib/nostr-tools/event";
import { convertEvent } from "../utils/event-converter";

export function useNostrGetUserProfileQuery(user: string) {
  return useNostrFetchQuery(
    ["chats/nostr-get-user-profile", user],
    [
      {
        kinds: [Kind.Metadata],
        authors: [user]
      }
    ],
    (events) =>
      events.map((event) => convertEvent<Kind.Metadata>(event)!!).filter((profile) => profile!!)
  );
}

export function useNostrGetUserProfilesQuery(users: string[]) {
  return useNostrFetchQuery(
    ["chats/nostr-get-user-profile", users.join("")],
    users.map((user) => ({
      kinds: [Kind.Metadata],
      authors: [user]
    })),
    (events) =>
      events.map((event) => convertEvent<Kind.Metadata>(event)!!).filter((profile) => profile!!),
    {
      initialData: []
    }
  );
}
