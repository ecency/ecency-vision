import { useCallback } from "react";
import { useTimeoutFn } from "react-use";
import {
  Channel,
  DirectContact,
  useDirectMessagesQuery,
  useMessagesQuery,
  usePublicMessagesQuery
} from "@ecency/ns-query";

export function useFocusOnMessageById(
  id?: string,
  currentChannel?: Channel,
  currentContact?: DirectContact
) {
  const messages = useMessagesQuery(currentContact, currentChannel);
  const directMessagesQuery = useDirectMessagesQuery(currentContact);
  const publicMessagesQuery = usePublicMessagesQuery(currentChannel);

  const getElementById = useCallback(async (): Promise<HTMLElement | null> => {
    try {
      return document.querySelector<HTMLElement>(`[data-message-id="${id}"]`);
    } catch (e) {
      // Fetch next page if there aren't any message
      if (currentContact) {
        await directMessagesQuery.fetchNextPage();
      } else if (publicMessagesQuery) {
        await publicMessagesQuery.fetchNextPage();
      }

      return getElementById();
    }
  }, [id]);

  const [isReady, cancel, reset] = useTimeoutFn(async () => {
    const element = await getElementById();

    element?.classList.remove("bg-blue-dark-sky");
    element?.classList.remove("bg-opacity-20");
  }, 1000);

  const focus = useCallback(async () => {
    const element = await getElementById();

    element?.scrollIntoView({ behavior: "smooth" });
    element?.classList.add("bg-blue-dark-sky");
    element?.classList.add("bg-opacity-20");

    reset();
  }, [id, getElementById, messages]);

  return {
    focus
  };
}
