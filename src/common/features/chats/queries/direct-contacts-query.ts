import { ChatQueries } from "./queries";
import { DirectContact } from "../managers/message-manager-types";
import { useKeysQuery } from "./keys-query";
import { useNostrFetchQuery } from "../nostr";
import { Kind } from "../../../../lib/nostr-tools/event";

export function useDirectContactsQuery() {
  const { hasKeys } = useKeysQuery();

  return useNostrFetchQuery<DirectContact[]>(
    [ChatQueries.DIRECT_CONTACTS],
    [Kind.Contacts],
    (events) => {
      // Get first event with profile info
      // note: events could be duplicated
      const profileEvent = events.find((event) => event.kind === Kind.Contacts);
      if (profileEvent) {
        return profileEvent.tags.map(([pubkey, name]) => ({ pubkey, name }));
      }
      return [];
    },
    {
      initialData: [],
      enabled: hasKeys
    }
  );
}
