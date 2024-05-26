import { GIPHGY } from "@/app/chats/_components/chat-popup/chat-constants";

export const isMessageGif = (content: string) => {
  return content.includes(GIPHGY);
};
