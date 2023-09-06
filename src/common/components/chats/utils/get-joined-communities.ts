import { Channel } from "../../../../providers/message-provider-types";

export const getJoinedCommunities = (channels: Channel[], leftChannels: string[]) => {
  return channels.filter((item) => !leftChannels.includes(item.id));
};
