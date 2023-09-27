import { PublicMessage } from "./../../../../managers/message-manager-types";
import { DirectMessage } from "../../../../managers/message-manager-types";
import { formatMessageDate } from "./format-message-time";

export const formatMessageDateAndDay = (
  msg: DirectMessage | PublicMessage,
  i: number,
  messagesList: DirectMessage[] | PublicMessage[]
) => {
  const prevMsg = messagesList[i - 1];
  const msgDate = formatMessageDate(msg.created);
  const prevMsgDate = prevMsg ? formatMessageDate(prevMsg.created) : null;
  if (msgDate !== prevMsgDate) {
    return msgDate;
  }
  return null;
};
