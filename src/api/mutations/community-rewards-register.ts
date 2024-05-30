import { useMutation } from "@tanstack/react-query";
import {
  communityRewardsRegister,
  communityRewardsRegisterKc,
  formatError
} from "@/api/operations";
import { error } from "@/features/shared";
import { Community } from "@/entities";
import { PrivateKey } from "@hiveio/dhive";

export function useCommunityRewardsRegisterKc(community: Community, onSuccess: () => void) {
  return useMutation({
    mutationKey: ["communityRewardsRegisterKc"],
    mutationFn: () => communityRewardsRegisterKc(community.name),
    onError: (err) => error(...formatError(err)),
    onSuccess
  });
}

export function useCommunityRewardsRegister(community: Community, onSuccess: () => void) {
  return useMutation({
    mutationKey: ["communityRewardsRegister"],
    mutationFn: ({ key }: { key: PrivateKey }) => communityRewardsRegister(key, community.name),
    onError: (err) => error(...formatError(err)),
    onSuccess
  });
}
