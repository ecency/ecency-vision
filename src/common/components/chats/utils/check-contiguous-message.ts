import { DirectMessage } from "./../../../../managers/message-manager-types";
import { PublicMessage } from "../../../../managers/message-manager-types";

export const checkContiguousMessage = (
  msg: PublicMessage | DirectMessage,
  i: number,
  publicMessages: PublicMessage[] | DirectMessage[]
) => {
  const prevMsg = publicMessages[i - 1];
  const msgAuthor = msg.creator;
  const prevMsgAuthor = prevMsg ? prevMsg.creator : null;
  if (msgAuthor === prevMsgAuthor) {
    return true;
  }
  return false;
};
