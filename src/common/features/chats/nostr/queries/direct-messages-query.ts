import { useNostrFetchQuery } from "../core";
import { DirectContact, Message } from "../../managers/message-manager-types";
import { Filter } from "../../../../../lib/nostr-tools/filter";
import { Kind } from "../../../../../lib/nostr-tools/event";
import { convertEvent } from "../utils/event-converter";

export function useDirectMessagesQuery(
  directContacts: DirectContact[],
  publicKey: string,
  privateKey: string
) {
  return useNostrFetchQuery<Message[]>(
    ["chats/encrypted-direct-messages"],
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
      enabled: directContacts.length > 0
    }
  );
}
