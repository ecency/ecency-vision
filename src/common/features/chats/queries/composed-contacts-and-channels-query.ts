import {
  useChannelsQuery,
  useDirectContactsQuery,
  useKeysQuery,
  useNostrGetUserProfileQuery
} from "@ecency/ns-query";
import { useMemo } from "react";
import { isAfter } from "date-fns";

export function useComposedContactsAndChannelsQuery() {
  const { publicKey } = useKeysQuery();
  const { data: contactsData } = useDirectContactsQuery();
  const { data: channelsData } = useChannelsQuery();

  const { data: activeUserNostrProfiles } = useNostrGetUserProfileQuery(publicKey);

  const channelsLastSeenDate = useMemo(
    () =>
      channelsData.reduce<Record<string, Date>>((acc, channel) => {
        if (activeUserNostrProfiles?.[0] && channel) {
          const channelsLastSeenTimestamps =
            activeUserNostrProfiles?.[0].channelsLastSeenDate ?? {};
          const lastSeenTimestamp = channelsLastSeenTimestamps[channel.id];
          return {
            ...acc,
            [channel.id]: lastSeenTimestamp
          };
        }
        return acc;
      }, {}),
    [channelsData, activeUserNostrProfiles]
  );

  return useMemo(
    () =>
      [...(contactsData ?? []), ...channelsData]
        .sort((a, b) => {
          let lastSeenDateA: Date | undefined;
          if ("lastSeenDate" in a) {
            lastSeenDateA = a.lastSeenDate;
          } else if ("id" in a) {
            lastSeenDateA = channelsLastSeenDate[a.id];
          }

          let lastSeenDateB: Date | undefined;
          if ("lastSeenDate" in b) {
            lastSeenDateB = b.lastSeenDate;
          } else if ("id" in b) {
            lastSeenDateB = channelsLastSeenDate[b.id];
          }

          if (
            lastSeenDateA instanceof Date &&
            lastSeenDateB instanceof Date &&
            isAfter(lastSeenDateA, lastSeenDateB)
          ) {
            return -1;
          }
          return 0;
        })
        .sort((a, b) => {
          if ("pinned" in a && "pinned" in b) {
            return +(b.pinned ?? false) - +(a.pinned ?? false);
          } else if ("pinned" in a) {
            return -1;
          } else if ("pinned" in b) {
            return 1;
          }
          return 0;
        }),
    [contactsData, channelsData, channelsLastSeenDate]
  );
}
