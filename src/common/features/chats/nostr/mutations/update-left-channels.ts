import { useNostrPublishMutation } from "../core";

export function useUpdateLeftChannels() {
  return useNostrPublishMutation(["chats/nostr-update-left-channels-list"], 30078, () => {});
}
