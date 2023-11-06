import { useNostrFetchQuery } from "../nostr";
import { findTagValue, isSha256 } from "../nostr/utils";
import { ChatQueries } from "./queries";
import { convertEvent } from "../nostr/utils/event-converter";

/**
 * Fetch custom kind of event which stores the left channels
 */
export function useLeftCommunityChannelsQuery() {
  return useNostrFetchQuery<string[]>(
    [ChatQueries.LEFT_CHANNELS],
    [30078],
    (events) => {
      if (events.length === 0) {
        return [];
      }
      const leftChannelsEvent = events
        .filter((x) => x.kind == 30078 && findTagValue(x, "d") === "left-channel-list")
        .sort((a, b) => b.created_at - a.created_at)[0];

      if (!leftChannelsEvent) {
        return [];
      }

      const content = convertEvent<30078>(leftChannelsEvent);
      if (Array.isArray(content) && content.every((x) => isSha256(x))) {
        return content;
      }

      return [];
    },
    {
      initialData: []
    }
  );
}
