import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useThreeSpeakManager } from "../_hooks";
import { useContext } from "react";
import { PollsContext } from "@/app/submit/_hooks/polls-manager";
import { useGlobalStore } from "@/core/global-store";
import { BeneficiaryRoute, Draft, DraftMetadata, RewardType } from "@/entities";
import { ThreeSpeakVideo } from "@/api/threespeak";
import { EntryMetadataManagement } from "@/features/entry-management";
import { addDraft, updateDraft } from "@/api/private-api";
import i18next from "i18next";
import { success } from "@/features/shared";
import { QueryIdentifiers } from "@/core/react-query";
import { error } from "highcharts";
import { useRouter } from "next/navigation";

export function useSaveDraftApi() {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { videos } = useThreeSpeakManager();
  const { activePoll, clearActivePoll } = useContext(PollsContext);

  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["saveDraft"],
    mutationFn: async ({
      title,
      body,
      tags,
      editingDraft,
      beneficiaries,
      reward,
      description,
      selectedThumbnail,
      selectionTouched,
      videoMetadata
    }: {
      title: string;
      body: string;
      tags: string[];
      editingDraft: Draft | null;
      beneficiaries: BeneficiaryRoute[];
      reward: RewardType;
      description: string | null;
      selectedThumbnail?: string;
      selectionTouched: boolean;
      videoMetadata?: ThreeSpeakVideo;
    }) => {
      const tagJ = tags.join(" ");

      const metaBuilder = await EntryMetadataManagement.EntryMetadataManager.shared
        .builder()
        .default()
        .extractFromBody(body)
        .withTags(tags)
        .withSummary(description ?? body)
        .withImages(selectedThumbnail, selectionTouched);

      const meta = metaBuilder.build();
      const draftMeta: DraftMetadata = {
        ...meta,
        beneficiaries,
        rewardType: reward,
        videos,
        poll: activePoll
      };

      try {
        if (editingDraft) {
          await updateDraft(activeUser?.username!, editingDraft._id, title, body, tagJ, draftMeta);
          success(i18next.t("submit.draft-updated"));
        } else {
          const resp = await addDraft(activeUser?.username!, title, body, tagJ, draftMeta);
          success(i18next.t("submit.draft-saved"));

          const { drafts } = resp;
          const draft = drafts[drafts?.length - 1];

          queryClient.setQueryData([QueryIdentifiers.DRAFTS, activeUser?.username], drafts);

          router.push(`/draft/${draft._id}`);
        }

        clearActivePoll();
      } catch (e) {
        error(i18next.t("g.server-error"));
      }
    }
  });
}
