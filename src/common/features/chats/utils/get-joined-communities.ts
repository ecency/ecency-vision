import { Channel } from "../../../../managers/message-manager-types";

export const getJoinedCommunities = (channels: Channel[], leftChannels: string[]) => {
  return channels.filter((item) => !leftChannels.includes(item.id));
};
