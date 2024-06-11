import { useMutation } from "@tanstack/react-query";
import { Community, Entry } from "@/entities";
import { formatError, mutePost } from "@/api/operations";
import { useGlobalStore } from "@/core/global-store";
import { error } from "@/features/shared";

export function useMutePost(entry: Entry, community: Community) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["mutePost", entry?.author, entry?.permlink],
    mutationFn: ({ notes, mute }: { notes: string; mute: boolean }) =>
      mutePost(activeUser!.username, community.name, entry.author, entry.permlink, notes, mute),
    onError: (err) => error(...formatError(err)),
    onSuccess: () => {
      // TODO: update cache of entries
    }
  });
}
