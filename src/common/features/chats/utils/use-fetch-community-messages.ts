import { Channel } from "../../../../managers/message-manager-types";
import { publicMessagesList } from "../../../store/chat/types";

export const fetchCommunityMessages = (
  publicMessages: publicMessagesList[],
  currentChannel: Channel,
  hiddenMessageIds?: string[]
) => {
  const hideMessageIds = hiddenMessageIds || currentChannel?.hiddenMessageIds || [];
  for (const item of publicMessages) {
    if (item.channelId === currentChannel.id) {
      return Object.values(item.PublicMessage).filter(
        (message) => !hideMessageIds.includes(message.id)
      );
    }
  }
  return [];
};
