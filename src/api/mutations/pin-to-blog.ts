import { useMutation } from "@tanstack/react-query";
import { Entry, FullAccount } from "@/entities";
import { error, success } from "@/features/shared";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import { useUpdateProfile } from "@/api/mutations/update-profile";
import { getAccount } from "@/api/hive";

export function usePinToBlog(entry: Entry, onSuccess: () => void) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const updateActiveUser = useGlobalStore((s) => s.updateActiveUser);

  const { mutateAsync: updateProfile } = useUpdateProfile(activeUser?.data as FullAccount);

  return useMutation({
    mutationKey: ["pinToBlog"],
    mutationFn: async ({ pin }: { pin: boolean }) => {
      const ownEntry = activeUser && activeUser.username === entry.author;
      const { profile, name } = activeUser!.data as FullAccount;

      if (ownEntry && pin && profile && activeUser) {
        await updateProfile({
          nextProfile: {
            name: profile?.name || "",
            about: profile?.about || "",
            cover_image: profile?.cover_image || "",
            profile_image: profile?.profile_image || "",
            website: profile?.website || "",
            location: profile?.location || "",
            pinned: entry.permlink
          }
        });
        success(i18next.t("entry-menu.pin-success"));

        const account = await getAccount(name);
        await updateActiveUser(account);
      } else if (ownEntry && !pin && profile && activeUser) {
        await updateProfile({
          nextProfile: {
            name: profile?.name || "",
            about: profile?.about || "",
            cover_image: profile?.cover_image || "",
            profile_image: profile?.profile_image || "",
            website: profile?.website || "",
            location: profile?.location || "",
            pinned: ""
          }
        });
        success(i18next.t("entry-menu.unpin-success"));

        const account = await getAccount(name);
        await updateActiveUser(account);
      }
    },
    onSuccess,
    onError: () => error(i18next.t("g.server-error"))
  });
}
