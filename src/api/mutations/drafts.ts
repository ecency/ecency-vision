import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalStore } from "@/core/global-store";
import { Draft, DraftMetadata } from "@/entities";
import i18next from "i18next";
import { addDraft, deleteDraft } from "@/api/private-api";
import { success } from "@/features/shared";
import { QueryIdentifiers } from "@/core/react-query";

export function useCloneDraft(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["drafts", "clone"],
    mutationFn: async ({ item }: { item: Draft }) => {
      const { title, body, tags, meta } = item;
      const cloneTitle = i18next.t("g.copy") + " " + title;
      const draftMeta: DraftMetadata = meta!;
      return addDraft(activeUser?.username!, cloneTitle, body, tags, draftMeta);
    },
    onSuccess: ({ drafts }) => {
      success(i18next.t("g.clone-success"));
      onSuccess();
      queryClient.setQueryData<Draft[]>(
        [QueryIdentifiers.DRAFTS, activeUser?.username],
        [...drafts]
      );
    }
  });
}

export function useDeleteDraft(onSuccess: (id: string) => void) {
  const queryClient = useQueryClient();
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["drafts", "delete"],
    mutationFn: async ({ id }: { id: string }) => {
      await deleteDraft(activeUser?.username!, id);
      return id;
    },
    onSuccess: (id) => {
      success(i18next.t("g.clone-success"));
      onSuccess(id);
      queryClient.setQueryData<Draft[]>(
        [QueryIdentifiers.DRAFTS, activeUser?.username],
        (
          queryClient.getQueryData<Draft[]>([QueryIdentifiers.DRAFTS, activeUser?.username]) ?? []
        ).filter((draft) => draft._id !== id)
      );
    }
  });
}
