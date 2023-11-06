import { MutationKey, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useContext } from "react";
import { NostrContext } from "../nostr";
import { Event, getEventHash, Kind, signEvent } from "../../../../lib/nostr-tools/event";
import { ChatContext } from "../chat-context-provider";
import { Metadata } from "../managers/message-manager-types";

type Payload = { eventMetadata: Metadata; tags: string[][] };

export function useNostrPublishMutation(
  key: MutationKey,
  kind: Kind,
  onBeforeSend: (event: Event) => void,
  options?: UseMutationOptions<Event, Error, Payload>
) {
  const { pool, writeRelays } = useContext(NostrContext);
  const { activeUserKeys } = useContext(ChatContext);

  const sign = async (event: Event) => ({
    ...event,
    id: getEventHash(event),
    sig: await signEvent(event, activeUserKeys.priv)
  });

  return useMutation(
    key,
    ({ eventMetadata, tags }: Payload) =>
      new Promise<Event>(async (resolve, reject) => {
        let signedEvent: Event | null;
        try {
          signedEvent = await sign({
            kind,
            id: "",
            sig: "",
            content: JSON.stringify(eventMetadata),
            pubkey: activeUserKeys.pub,
            created_at: Math.floor(Date.now() / 1000),
            tags
          });
        } catch (e) {
          signedEvent = null;
        }
        if (!signedEvent) {
          reject(new Error("[Chat][Nostr] – event couldn't be signed(kind: " + kind));
          return;
        }

        onBeforeSend(signedEvent);

        const publishInfo = pool?.publish(writeRelays, signedEvent);
        publishInfo?.on("ok", () => resolve(signedEvent!!));
        publishInfo?.on("failed", () =>
          reject(new Error("[Chat][Nostr] – failed to publish event (kind: " + signedEvent!!.kind))
        );
      }),
    options
  );
}
