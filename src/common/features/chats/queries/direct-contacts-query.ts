import { ChatQueries } from "./queries";
import { useKeysQuery } from "./keys-query";
import { DirectContact, useNostrFetchQuery } from "../nostr";
import { Kind } from "../../../../lib/nostr-tools/event";
import { useMappedStore } from "../../../store/use-mapped-store";

export function useDirectContactsQuery() {
  const { activeUser } = useMappedStore();
  const { hasKeys } = useKeysQuery();

  return useNostrFetchQuery<DirectContact[]>(
    [ChatQueries.DIRECT_CONTACTS, activeUser?.username],
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
