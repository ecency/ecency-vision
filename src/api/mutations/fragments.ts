import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFragment, deleteFragment, updateFragment } from "@/api/private-api";
import { useGlobalStore } from "@/core/global-store";
import { Fragment } from "@/entities";
import { error } from "@/features/shared";
import i18next from "i18next";
import { QueryIdentifiers } from "@/core/react-query";

export function useAddFragment(onSuccess?: () => void) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const queryClient = useQueryClient();

  return useMutation<{ fragments: Fragment[] }, Error, { title: string; body: string }>({
    mutationKey: ["fragments", "add", activeUser?.username],
    mutationFn: async ({ title, body }) => {
      if (!activeUser) {
        throw new Error("[Fragments] – no active user");
      }

      return addFragment(activeUser!.username, title, body);
    },
    onSuccess: ({ fragments }) => {
      onSuccess?.();
      queryClient.setQueryData([QueryIdentifiers.FRAGMENTS, activeUser?.username], [...fragments]);
    },
    onError: () => {
      error(i18next.t("g.server-error"));
    }
  });
}

export function useUpdateFragment(id: string, onSuccess?: () => void) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const queryClient = useQueryClient();

  return useMutation<Fragment[], Error, { title: string; body: string }>({
    mutationKey: ["fragments", "update", activeUser?.username, id],
    mutationFn: async ({ title, body }) => {
      if (!activeUser) {
        throw new Error("[Fragments] – no active user");
      }

      return updateFragment(activeUser!.username, id, title, body);
    },
    onSuccess: (fragments) => {
      queryClient.setQueryData(
        [QueryIdentifiers.FRAGMENTS, activeUser?.username],
        [
          ...(
            queryClient.getQueryData<Fragment[]>([
              QueryIdentifiers.FRAGMENTS,
              activeUser?.username
            ]) ?? []
          ).filter((fr) => fragments.every((updatedFr) => fr.id !== updatedFr.id)),
          ...fragments
        ]
      );
      onSuccess?.();
    },
    onError: () => {
      error(i18next.t("g.server-error"));
    }
  });
}

export function useDeleteFragment(id: string, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["fragments", "delete", activeUser?.username, id],
    mutationFn: async () => {
      if (!activeUser) {
        throw new Error("[Fragments] – no active user");
      }

      return deleteFragment(activeUser!.username, id);
    },
    onSuccess: (fragments) => {
      onSuccess?.();
      queryClient.setQueryData([QueryIdentifiers.FRAGMENTS, activeUser?.username], [...fragments]);
    },
    onError: () => {
      error(i18next.t("g.server-error"));
    }
  });
}
