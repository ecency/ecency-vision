import { useNostrPublishMutation } from "../core";
import { Kind } from "../../../../../lib/nostr-tools/event";
import { useMutation } from "@tanstack/react-query";
import { encrypt } from "../../../../../lib/nostr-tools/nip04";
import { useFindHealthyRelayQuery } from "./find-healthy-relay";
import { convertEvent } from "../utils/event-converter";
import { useContext } from "react";
import { ChatContext } from "../../chat-context-provider";

export function useNostrSendDirectMessage(
  ownerPrivateKey: string,
  destinationPublicKey: string,
  parent?: string
) {
  const { activeUserKeys } = useContext(ChatContext);

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
    const event = await publishEncryptedMessage({
      tags,
      eventMetadata: encryptedMessage
    });
    return convertEvent<Kind.EncryptedDirectMessage>(
      event,
      activeUserKeys.pub,
      activeUserKeys.priv
    )!!;
  });
}
