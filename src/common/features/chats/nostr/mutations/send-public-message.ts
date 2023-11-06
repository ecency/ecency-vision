import { useNostrPublishMutation } from "../core";
import { Kind } from "../../../../../lib/nostr-tools/event";
import { useMutation } from "@tanstack/react-query";
import { useFindHealthyRelayQuery } from "./find-healthy-relay";

interface Payload {
  message: string;
  mentions?: string[];
}

export function useNostrSendPublicMessage(channelId: string, parent?: string) {
  const { mutateAsync: publishEncryptedMessage } = useNostrPublishMutation(
    ["chats/nostr-publish-channel-message"],
    Kind.ChannelMessage,
    () => {}
  );
  const { mutateAsync: findHealthyRelay } = useFindHealthyRelayQuery();

  return useMutation(["chats/send-public-message"], async ({ message, mentions }: Payload) => {
    const root = parent || channelId;
    const relay = await findHealthyRelay(root);

    const tags: string[][] = [];
    if (relay) {
      tags.push(["e", root, relay, "root"]);
    }

    if (mentions) {
      mentions.forEach((m) => tags.push(["p", m]));
    }

    return publishEncryptedMessage({
      tags,
      eventMetadata: message
    });
  });
}
