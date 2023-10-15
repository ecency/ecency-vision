import { DirectMessage, PublicMessage } from "../../../../managers/message-manager-types";

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
