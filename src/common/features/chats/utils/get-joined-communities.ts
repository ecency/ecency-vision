import { Channel } from "../nostr";

export const getJoinedCommunities = (channels: Channel[], leftChannels: string[]) => {
  return channels.filter((item) => !leftChannels.includes(item.id));
};
