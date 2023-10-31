import { Message } from "../managers/message-manager-types";

export const getDirectLastMessage = (directMessages: Message[]) => {
  const messages = directMessages.sort((a, b) => a.created - b.created);
  const lastMessage = messages.slice(-1);
  return lastMessage[0];
};
