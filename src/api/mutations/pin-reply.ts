import { useMutation } from "@tanstack/react-query";
import pack from "../../../package.json";
import { useUpdateReply } from "./update-reply";
import { makeJsonMetaDataReply } from "@/utils";
import { Entry, MetaData } from "@/entities";

export function usePinReply(reply?: Entry, parent?: Entry) {
  const { mutateAsync: updateReply } = useUpdateReply(parent);

  return useMutation({
    mutationKey: ["reply-pin", reply, parent],
    mutationFn: async ({ pin }: { pin: boolean }) => {
      if (!reply || !parent) {
        throw new Error("No reply or parent provided");
      }

      const meta = makeJsonMetaDataReply(
        parent.json_metadata.tags || ["ecency"],
        pack.version
      ) as MetaData;
      meta.pinned_reply = pin ? `${reply.author}/${reply.permlink}` : undefined;
      return updateReply({ text: parent.body, point: true, jsonMeta: meta });
    }
  });
}
