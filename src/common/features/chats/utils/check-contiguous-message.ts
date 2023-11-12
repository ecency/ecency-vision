import { DirectMessage, PublicMessage } from "../nostr";

export const checkContiguousMessage = (
  msg: PublicMessage | DirectMessage,
  i: number,
  publicMessages: PublicMessage[] | DirectMessage[]
) => {
  const prevMsg = publicMessages[i - 1];
  const msgAuthor = msg.creator;
  const prevMsgAuthor = prevMsg ? prevMsg.creator : null;
  return msgAuthor === prevMsgAuthor;
};
