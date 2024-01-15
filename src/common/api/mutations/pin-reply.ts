import { useMutation } from "@tanstack/react-query";
import { Entry } from "../../store/entries/types";
import { createPatch, makeJsonMetaDataReply } from "../../helper/posting";
import { version } from "../../../../package.json";
import { useUpdateReply } from "./update-reply";
import { MetaData } from "../operations";

export function usePinReply(reply: Entry, parent: Entry) {
  const { mutateAsync: updateReply } = useUpdateReply(parent);

  return useMutation(["reply-pin", reply, parent], async ({ pin }: { pin: boolean }) => {
    const meta = makeJsonMetaDataReply(
      parent.json_metadata.tags || ["ecency"],
      version
    ) as MetaData;

    let newBody = parent.body.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "");
    const patch = createPatch(parent.body, newBody.trim());
    if (patch && patch.length < Buffer.from(parent.body, "utf-8").length) {
      newBody = patch;
    }

    meta.pinned_reply = pin ? `${reply.author}/${reply.permlink}` : undefined;
    return updateReply({ text: newBody, point: true, jsonMeta: meta });
  });
}
