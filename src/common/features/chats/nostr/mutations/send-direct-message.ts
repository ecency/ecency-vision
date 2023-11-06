import { useNostrPublishMutation } from "../core";
import { Kind } from "../../../../../lib/nostr-tools/event";
import { useMutation } from "@tanstack/react-query";
import { encrypt } from "../../../../../lib/nostr-tools/nip04";
import { useFindHealthyRelayQuery } from "./find-healthy-relay";

export function useNostrSendDirectMessage(
  ownerPrivateKey: string,
  destinationPublicKey: string,
  parent?: string
) {
  const { mutateAsync: publishEncryptedMessage } = useNostrPublishMutation(
    ["chats/nostr-publish-encrypted-message"],
    Kind.EncryptedDirectMessage,
    () => {}
  );
  const { mutateAsync: findHealthyRelay } = useFindHealthyRelayQuery();

  return useMutation(["chats/send-direct-message"], async (message: string) => {
    const encryptedMessage = await encrypt(ownerPrivateKey, destinationPublicKey, message);
    const tags = [["p", destinationPublicKey]];

    if (parent) {
      const relay = await findHealthyRelay(parent);
      if (relay) {
        tags.push(["e", parent, relay, "root"]);
      }
    }
    return publishEncryptedMessage({
      tags,
      eventMetadata: encryptedMessage
    });
  });
}
