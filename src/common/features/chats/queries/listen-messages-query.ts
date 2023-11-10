import { useQueryClient } from "@tanstack/react-query";
import useInterval from "react-use/lib/useInterval";
import { NostrQueries } from "../nostr/queries";
import { ChatQueries } from "./queries";
import { useDirectContactsQuery } from "./direct-contacts-query";
import { useChannelsQuery } from "./channels-query";
import { useMemo } from "react";

export function useListenMessagesQuery() {
  const queryClient = useQueryClient();
  const { data: contacts } = useDirectContactsQuery();
  const { data: channels } = useChannelsQuery();

  const peers = useMemo(
    () => [
      ...(channels?.map((channel) => channel.communityName) ?? []),
      ...(contacts?.map((contact) => contact.name) ?? [])
    ],
    [channels, contacts]
  );

  useInterval(async () => {
    await queryClient.invalidateQueries([NostrQueries.PUBLIC_MESSAGES]);
    await queryClient.invalidateQueries([NostrQueries.DIRECT_MESSAGES]);
    await queryClient.invalidateQueries([ChatQueries.LAST_MESSAGES]);

    setTimeout(
      () => peers.forEach((peer) => queryClient.invalidateQueries([ChatQueries.MESSAGES, peer])),
      3000
    );
  }, 10000);
}
