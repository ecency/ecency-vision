import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "@/api/operations";
import { AccountProfile, FullAccount } from "@/entities";
import { error, success } from "@/features/shared";
import i18next from "i18next";
import { getQueryClient, QueryIdentifiers } from "@/core/react-query";

export function useUpdateProfile(account: FullAccount) {
  return useMutation({
    mutationKey: ["update-profile", account],
    mutationFn: async ({ nextProfile }: { nextProfile: AccountProfile }) => {
      const profile = account.profile;
      await updateProfile(account, { ...profile, ...nextProfile });
      return profile;
    },
    onSuccess: (profile) => {
      success(i18next.t("g.success"));

      getQueryClient().setQueryData<FullAccount>(
        [QueryIdentifiers.GET_ACCOUNT_FULL, account.name],
        (data) => {
          if (!data) {
            return data;
          }

          return {
            ...data,
            profile
          };
        }
      );
    },
    onError: () => {
      error(i18next.t("g.server-error"));
    }
  });
}
