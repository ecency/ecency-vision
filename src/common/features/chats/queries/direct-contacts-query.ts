import { ChatQueries } from "./queries";
import { MessageEvents } from "../../../helper/message-service";
import { DirectContact } from "../managers/message-manager-types";
import { useMessageListenerQuery } from "./message-listener-query";

export function useDirectContactsQuery() {
  return useMessageListenerQuery<DirectContact[], ChatQueries[]>(
    [ChatQueries.DIRECT_CONTACTS],
    MessageEvents.DirectContact,
    (data, directContacts, resolver) => {
      const result = [...data];
      directContacts.forEach(({ name, pubkey }) => {
        const isPresent = data.some((obj) => obj.name === name && obj.pubkey === pubkey);
        if (!isPresent) {
          result.push({ name, pubkey });
        }
      });
      if (result.length !== 0) {
        resolver(result);
      }
    },
    {
      initialData: []
    }
  );
}
