import { useNostrPublishMutation } from "../core";
import { Kind } from "../../../../../lib/nostr-tools/event";
import { useMutation } from "@tanstack/react-query";
import { encrypt } from "../../../../../lib/nostr-tools/nip04";
import { useFindHealthyRelayQuery } from "./find-healthy-relay";
import { convertEvent } from "../utils/event-converter";
import { useKeysQuery } from "../../queries/keys-query";

export function useNostrSendDirectMessage(
  ownerPrivateKey: string,
  destinationPublicKey: string,
  parent?: string
) {
  const { privateKey, publicKey } = useKeysQuery();

  const { mutateAsync: publishEncryptedMessage } = useNostrPublishMutation(
    ["chats/nostr-publish-encrypted-message"],
    Kind.EncryptedDirectMessage,
    () => {}
  );
  const { mutateAsync: findHealthyRelay } = useFindHealthyRelayQuery();

  return useMutation(["chats/send-direct-message"], async (message: string) => {
    if (!publicKey || !privateKey) {
      throw new Error(
        "[Chat][Nostr] – attempting to send direct message with no private and public key"
      );
    }

    const encryptedMessage = await encrypt(ownerPrivateKey, destinationPublicKey, message);
    const tags = [["p", destinationPublicKey]];

    if (parent) {
      const relay = await findHealthyRelay(parent);
      if (relay) {
        tags.push(["e", parent, relay, "root"]);
      }
    }
    const event = await publishEncryptedMessage({
      tags,
      eventMetadata: encryptedMessage
    });
    return convertEvent<Kind.EncryptedDirectMessage>(event, publicKey, privateKey)!!;
  });
}
