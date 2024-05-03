import { useMutation } from "@tanstack/react-query";
import { comment, formatError } from "../../../api/operations";
import { Entry } from "../../../store/entries/types";
import { correctIsoDate } from "../../../helper/temp-entry";
import moment from "moment/moment";
import { error, success } from "../../../components/feedback";
import { _t } from "../../../i18n";
import { makePath as makePathEntry } from "../../../components/entry-link";
import { useMappedStore } from "../../../store/use-mapped-store";
import { History } from "history";
import { useContext } from "react";
import { EntriesCacheContext } from "../../../core";
import { useThreeSpeakManager } from "../hooks";
import { EntryBodyManagement, EntryMetadataManagement } from "../../../features/entry-management";

export function useUpdateApi(history: History, onClear: () => void) {
  const { activeUser } = useMappedStore();
  const { updateCache } = useContext(EntriesCacheContext);
  const { buildBody } = useThreeSpeakManager();

  return useMutation(
    ["update"],
    async ({
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
        success(_t("submit.updated"));
        const newLoc = makePathEntry(category, author, permlink);
        history.push(newLoc);
      } catch (e) {
        error(...formatError(e));
      }
    }
  );
}
