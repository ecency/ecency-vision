import { useMutation } from "@tanstack/react-query";
import { Entry } from "../../store/entries/types";
import { useUpdateReply } from "./update-reply";
import { EntryBodyManagement, EntryMetadataManagement } from "../../features/entry-management";

export function usePinReply(reply: Entry, parent: Entry) {
  const { mutateAsync: updateReply } = useUpdateReply(parent);

  return useMutation(["reply-pin", reply, parent], async ({ pin }: { pin: boolean }) => {
    return updateReply({
      text: EntryBodyManagement.EntryBodyManager.shared
        .builder()
        .buildPatchFrom(parent, parent.body),
      point: true,
      jsonMeta: EntryMetadataManagement.EntryMetadataManager.shared
        .builder()
        .extend(parent)
        .setPinnedReply(reply, pin)
        .build()
    });
  });
}
