import { GIPHGY } from "../components/chat-popup/chat-constants";

export const isMessageGif = (content: string) => {
  return content.includes(GIPHGY);
};
