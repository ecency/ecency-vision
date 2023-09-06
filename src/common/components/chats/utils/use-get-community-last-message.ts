import { publicMessagesList } from "../../../store/chat/types";

export const getCommunityLastMessage = (
  channelId: string,
  publicMessages: publicMessagesList[]
) => {
  const msgsList = fetchChannelMessages(channelId!, publicMessages);
  const messages = msgsList.sort((a, b) => a.created - b.created);
  const lastMessage = messages.slice(-1);
  return lastMessage[0]?.content;
};

const fetchChannelMessages = (channelId: string, publicMessages: publicMessagesList[]) => {
  for (const item of publicMessages) {
    if (item.channelId === channelId) {
      return Object.values(item.PublicMessage);
    }
  }
  return [];
};
