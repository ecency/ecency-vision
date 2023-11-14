import { useLayoutEffect } from "react";
import { useMessagesQuery } from "../queries";

export function useAutoScrollInChatBox(username: string) {
  const { data } = useMessagesQuery(username);

  useLayoutEffect(() => {
    if (data.length > 0) {
      const first = data[data.length - 1];
      const messageElement = document.querySelector(`[data-message-id='${first.id}']`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [data]);
}
