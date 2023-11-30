import {
  MutationKey,
  useMutation,
  UseMutationOptions,
  useQueryClient
} from "@tanstack/react-query";
import { useContext } from "react";
import { Event, getEventHash, Kind, signEvent } from "../../../../../lib/nostr-tools/event";
import { NostrContext } from "../nostr-context";
import { Metadata } from "../types";
import { ChatQueries } from "../../queries";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { PublishNostrError } from "../errors";

type Payload = { eventMetadata: Metadata | string; tags: string[][] };

export function useNostrPublishMutation(
  key: MutationKey,
  kind: Kind,
  onBeforeSend: (event: Event) => void,
  options?: UseMutationOptions<Event, PublishNostrError | Error, Payload>
) {
  const { activeUser } = useMappedStore();
  const { pool, writeRelays } = useContext(NostrContext);
  const queryClient = useQueryClient();

  const sign = async (event: Event) => ({
    ...event,
    id: getEventHash(event),
    sig: await signEvent(
      event,
      queryClient.getQueryData<string>([ChatQueries.PRIVATE_KEY, activeUser?.username])!!
    )
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
            pubkey: queryClient.getQueryData<string>([
              ChatQueries.PUBLIC_KEY,
              activeUser?.username
            ])!!,
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
          reject(
            new PublishNostrError(
              "[Chat][Nostr] – failed to publish event (kind: " + signedEvent!!.kind,
              signedEvent!!
            )
          )
        );
      }),
    options
  );
}
