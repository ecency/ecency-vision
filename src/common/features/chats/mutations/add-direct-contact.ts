import { useMutation } from "@tanstack/react-query";
import { useDirectContactsQuery } from "../queries";
import { DirectContact } from "../managers/message-manager-types";
import { useNostrPublishMutation } from "../nostr";
import { Kind } from "../../../../lib/nostr-tools/event";

export function useAddDirectContact() {
  const { mutateAsync: publishDirectContact } = useNostrPublishMutation(
    ["chats/nostr-publish-direct-contact"],
    Kind.Contacts,
    () => {}
  );
  const { data: directContacts } = useDirectContactsQuery();

  return useMutation(["chats/add-direct-contact"], async (contact: DirectContact) => {
    const hasInDirectContactsAlready = directContacts?.some(
      (c) => c.name === contact.name && c.pubkey === contact.pubkey
    );
    if (!hasInDirectContactsAlready) {
      return publishDirectContact({
        tags: [
          ...(directContacts ?? []).map((contact) => [contact.pubkey, contact.name]),
          [contact.pubkey, contact.name]
        ],
        eventMetadata: ""
      });
    }
    return;
  });
}
