import { useMutation } from "@tanstack/react-query";
import { comment, formatError } from "@/api/operations";
import moment from "moment/moment";
import { useContext } from "react";
import { useThreeSpeakManager } from "../_hooks";
import { EntryBodyManagement, EntryMetadataManagement } from "@/features/entry-management";
import { useGlobalStore } from "@/core/global-store";
import { EntriesCacheContext } from "@/core/caches";
import { Entry } from "@/entities";
import { correctIsoDate, makeEntryPath } from "@/utils";
import { error, success } from "@/features/shared";
import i18next from "i18next";
import { useRouter } from "next/navigation";

export function useUpdateApi(onClear: () => void) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { updateCache } = useContext(EntriesCacheContext);
  const { buildBody } = useThreeSpeakManager();
  const router = useRouter();

  return useMutation({
    mutationKey: ["update"],
    mutationFn: async ({
      title,
      tags,
      body,
      description,
      editingEntry,
      selectionTouched,
      selectedThumbnail
    }: {
      title: string;
      tags: string[];
      body: string;
      description: string | null;
      editingEntry: Entry;
      selectionTouched: boolean;
      selectedThumbnail?: string;
    }) => {
      if (!editingEntry) {
        return;
      }

      const { author, permlink, category, json_metadata } = editingEntry;
      const newBody = EntryBodyManagement.EntryBodyManager.shared
        .builder()
        .buildPatchFrom(editingEntry, body);
      const metaBuilder = await EntryMetadataManagement.EntryMetadataManager.shared
        .builder()
        .extend(editingEntry)
        .withSummary(description ?? newBody)
        .withTags(tags)
        .withPoll()
        .withImages(selectedThumbnail, selectionTouched, json_metadata.image);

      const jsonMeta = metaBuilder.build();

      try {
        await comment(
          activeUser?.username!,
          "",
          category,
          permlink,
          title,
          buildBody(newBody),
          jsonMeta,
          null
        );

        // Update the entry object in store
        const entry: Entry = {
          ...editingEntry,
          title,
          body: buildBody(body),
          category: tags[0],
          json_metadata: jsonMeta,
          updated: correctIsoDate(moment().toISOString())
        };
        updateCache([entry]);

        onClear();
        success(i18next.t("submit.updated"));
        const newLoc = makeEntryPath(category, author, permlink);
        router.push(newLoc);
      } catch (e) {
        error(...formatError(e));
      }
    }
  });
}
