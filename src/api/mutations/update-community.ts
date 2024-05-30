import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatError, updateCommunity } from "@/api/operations";
import { useGlobalStore } from "@/core/global-store";
import { Community } from "@/entities";
import { QueryIdentifiers } from "@/core/react-query";
import { clone } from "remeda";
import { error } from "@/features/shared";

export function useUpdateCommunity(community: Community) {
  const queryClient = useQueryClient();

  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["updateCommunity"],
    mutationFn: async ({ payload }: { payload: Parameters<typeof updateCommunity>[2] }) => {
      await updateCommunity(activeUser!.username, community.name, payload);
      return payload;
    },
    onSuccess: (payload) => {
      queryClient.setQueryData([QueryIdentifiers.COMMUNITY, community.name], {
        ...clone(community),
        ...payload
      });
    },
    onError: (err) => error(...formatError(err))
  });
}
