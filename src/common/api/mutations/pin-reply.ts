import { useMutation } from "@tanstack/react-query";
import { Entry } from "../../store/entries/types";
import { makeJsonMetaDataReply } from "../../helper/posting";
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
    meta.pinned_reply = pin ? `${reply.author}/${reply.permlink}` : undefined;
    return updateReply({ text: parent.body, point: true, jsonMeta: meta });
  });
}
