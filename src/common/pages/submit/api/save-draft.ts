import { useMutation } from "@tanstack/react-query";
import { addDraft, Draft, DraftMetadata, updateDraft } from "../../../api/private-api";
import { error, success } from "../../../components/feedback";
import { _t } from "../../../i18n";
import { History } from "history";
import { useMappedStore } from "../../../store/use-mapped-store";
import { BeneficiaryRoute, RewardType } from "../../../api/operations";
import { buildMetadata } from "../functions";
import { ThreeSpeakVideo } from "../../../api/threespeak";

export function useSaveDraftApi(history: History) {
  const { activeUser } = useMappedStore();

  return useMutation(
    ["saveDraft"],
    async ({
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

      const meta = buildMetadata({
        title,
        body,
        tags,
        selectedThumbnail,
        selectionTouched,
        videoMetadata,
        description
      });
      const draftMeta: DraftMetadata = {
        ...meta,
        beneficiaries,
        rewardType: reward
      };

      try {
        if (editingDraft) {
          await updateDraft(activeUser?.username!, editingDraft._id, title, body, tagJ, draftMeta);
          success(_t("submit.draft-updated"));
        } else {
          const resp = await addDraft(activeUser?.username!, title, body, tagJ, draftMeta);
          success(_t("submit.draft-saved"));

          const { drafts } = resp;
          const draft = drafts[drafts?.length - 1];

          history.push(`/draft/${draft._id}`);
        }
      } catch (e) {
        error(_t("g.server-error"));
      }
    }
  );
}
