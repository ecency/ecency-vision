import { Channel } from "../../../../providers/message-provider-types";
import { publicMessagesList } from "../../../store/chat/types";

export const fetchCommunityMessages = (
  publicMessages: publicMessagesList[],
  currentChannel: Channel,
  hiddenMessageIds?: string[]
) => {
  const hideMessageIds = hiddenMessageIds || currentChannel?.hiddenMessageIds || [];
  for (const item of publicMessages) {
    if (item.channelId === currentChannel.id) {
      const filteredPublicMessages = Object.values(item.PublicMessage).filter(
        (message) => !hideMessageIds.includes(message.id)
      );
      return filteredPublicMessages;
    }
  }
  return [];
};
