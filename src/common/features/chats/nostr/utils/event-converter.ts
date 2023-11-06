import { Event, Kind } from "../../../../../lib/nostr-tools/event";
import { Channel } from "../../managers/message-manager-types";

export interface EventConverterResult {
  [Kind.ChannelCreation]: Channel;
  30078: string[];
}

export function convertEvent<KIND extends keyof EventConverterResult>(
  event: Event
): EventConverterResult[KIND] | null {
  try {
    const content = JSON.parse(event.content);

    if (!content) {
      return null;
    }

    switch (event.kind as any) {
      case Kind.ChannelCreation:
        return {
          id: event.id,
          creator: event.pubkey,
          created: event.created_at,
          communityName: content.communityName,
          communityModerators: content.communityModerators,
          hiddenMessageIds: content.hiddenMessageIds,
          removedUserIds: content.removedUserIds,
          name: content.name,
          about: content.about,
          picture: content.picture
        } as any;
      case "30078":
        return content;
      default:
        return content;
    }
  } catch (e) {
    console.error(new Error("[Chat][Nostr] – message content is not a JSON"));
    return null;
  }
}
