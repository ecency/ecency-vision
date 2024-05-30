import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/api/operations";
import { AccountProfile, FullAccount } from "@/entities";
import { error, success } from "@/features/shared";
import i18next from "i18next";

export function useUpdateProfile(account: FullAccount) {
  return useMutation({
    mutationKey: ["update-profile", account],
    mutationFn: async ({ nextProfile }: { nextProfile: AccountProfile }) => {
      const profile = account.profile;
      return updateProfile(account, { ...profile, ...nextProfile });
    },
    onSuccess: () => {
      success(i18next.t("community-card.profile-image-updated"));
    },
    onError: () => {
      error(i18next.t("g.server-error"));
    }
  });
}
