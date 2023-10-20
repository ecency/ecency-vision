import { directMessagesList } from "../../../store/chat/types";

export const getDirectLastMessage = (pubkey: string, directMessages: directMessagesList[]) => {
  const msgsList = fetchDirectMessages(pubkey, directMessages);
  const messages = msgsList.sort((a, b) => a.created - b.created);
  const lastMessage = messages.slice(-1);
  return lastMessage[0];
};

const fetchDirectMessages = (peer: string, directMessages: directMessagesList[]) => {
  for (const item of directMessages) {
    if (item.peer === peer) {
      return Object.values(item.chat);
    }
  }
  return [];
};
