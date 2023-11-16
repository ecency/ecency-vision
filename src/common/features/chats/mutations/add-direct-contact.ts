import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatQueries, useDirectContactsQuery } from "../queries";
import { DirectContact, useNostrPublishMutation } from "../nostr";
import { Kind } from "../../../../lib/nostr-tools/event";
import { useMappedStore } from "../../../store/use-mapped-store";

export function useAddDirectContact() {
  const queryClient = useQueryClient();

  const { activeUser } = useMappedStore();
  const { data: directContacts } = useDirectContactsQuery();
  const { mutateAsync: publishDirectContact } = useNostrPublishMutation(
    ["chats/nostr-publish-direct-contact"],
    Kind.Contacts,
    () => {}
  );

  return useMutation(
    ["chats/add-direct-contact"],
    async (contact: DirectContact) => {
      const hasInDirectContactsAlready = directContacts?.some(
        (c) => c.name === contact.name && c.pubkey === contact.pubkey
      );
      if (!hasInDirectContactsAlready) {
        await publishDirectContact({
          tags: [
            ...(directContacts ?? []).map((contact) => [contact.pubkey, contact.name]),
            [contact.pubkey, contact.name]
          ],
          eventMetadata: ""
        });

        return contact;
      }
      return;
    },
    {
      onSuccess: (contact) => {
        if (contact) {
          queryClient.setQueryData(
            [ChatQueries.DIRECT_CONTACTS, activeUser?.username],
            [...(directContacts ?? []), contact]
          );
        }
      }
    }
  );
}
