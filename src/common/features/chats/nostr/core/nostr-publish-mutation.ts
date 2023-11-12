import { MutationKey, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useContext } from "react";
import { Event, getEventHash, Kind, signEvent } from "../../../../../lib/nostr-tools/event";
import { NostrContext } from "../nostr-context";
import { useKeysQuery } from "../../queries/keys-query";
import { Metadata } from "../types";

type Payload = { eventMetadata: Metadata | string; tags: string[][] };

export function useNostrPublishMutation(
  key: MutationKey,
  kind: Kind,
  onBeforeSend: (event: Event) => void,
  options?: UseMutationOptions<Event, Error, Payload>
) {
  const { pool, writeRelays } = useContext(NostrContext);
  const { publicKey, privateKey } = useKeysQuery();

  const sign = async (event: Event) => ({
    ...event,
    id: getEventHash(event),
    sig: await signEvent(event, privateKey!!)
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
            content:
              typeof eventMetadata === "object" ? JSON.stringify(eventMetadata) : eventMetadata,
            pubkey: publicKey!!,
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
