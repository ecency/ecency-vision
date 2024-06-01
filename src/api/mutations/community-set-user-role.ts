import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Community, CommunityTeam } from "@/entities";
import { formatError, setUserRole } from "@/api/operations";
import { useGlobalStore } from "@/core/global-store";
import { clone } from "remeda";
import { QueryIdentifiers } from "@/core/react-query";
import { error } from "@/features/shared";

export function useCommunitySetUserRole(community: Community, onSuccess: () => void) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["community-set-user-role"],
    mutationFn: async ({ user, role }: { user: string; role: string }) => {
      await setUserRole(activeUser!.username, community.name, user, role);
      return { user, role };
    },
    onSuccess: ({ user, role }) => {
      const team: CommunityTeam = clone(community.team);
      const nTeam =
        team.find((x) => x[0] === user) === undefined
          ? [...team, [user, role, ""]]
          : team.map((x) => (x[0] === user ? [x[0], role, x[2]] : x));
      queryClient.setQueryData([QueryIdentifiers.COMMUNITY, community.name], {
        ...clone(community),
        ...{ ...clone(community), team: nTeam }
      });
    },
    onError: (err) => error(...formatError(err))
  });
}
