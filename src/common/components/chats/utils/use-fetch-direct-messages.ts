import { directMessagesList } from "../../../store/chat/types";

export const fetchDirectMessages = (peer: string, directMessages: directMessagesList[]) => {
  for (const item of directMessages) {
    if (item.peer === peer) {
      return Object.values(item.chat);
    }
  }
  return [];
};
