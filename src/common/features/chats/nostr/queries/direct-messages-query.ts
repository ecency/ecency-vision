import { useNostrFetchQuery } from "../core";
import { Filter } from "../../../../../lib/nostr-tools/filter";
import { Kind } from "../../../../../lib/nostr-tools/event";
import { convertEvent } from "../utils/event-converter";
import { NostrQueries } from "./queries";
import { DirectContact, Message } from "../types";

export function useDirectMessagesQuery(
  directContacts: DirectContact[],
  publicKey: string,
  privateKey: string
) {
  return useNostrFetchQuery<Message[]>(
    [NostrQueries.DIRECT_MESSAGES],
    directContacts.reduce<Filter[]>(
      (acc, contact) => [
        ...acc,
        {
          kinds: [Kind.EncryptedDirectMessage],
          "#p": [contact.pubkey],
          authors: [publicKey]
        },
        {
          kinds: [Kind.EncryptedDirectMessage],
          "#p": [publicKey],
          authors: [contact.pubkey]
        }
      ],
      []
    ),
    async (events) =>
      Promise.all(
        events.map(
          (event) => convertEvent<Kind.EncryptedDirectMessage>(event, publicKey, privateKey)!!
        )
      ),
    {
      enabled: directContacts.length > 0,
      initialData: []
    }
  );
}
