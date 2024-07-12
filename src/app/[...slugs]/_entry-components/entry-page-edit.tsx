"use client";
import { Comment } from "@/features/shared";
import i18next from "i18next";
import { Entry } from "@/entities";
import { useRouter } from "next/navigation";
import { EcencyClientServerBridge } from "@/core/client-server-bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components/context";
import { useUpdateReply } from "@/api/mutations";
import { makeJsonMetaDataReply } from "@/utils";
import appPackage from "../../../../package.json";

export interface Props {
  entry: Entry;
}

export function EntryPageEdit({ entry }: Props) {
  const router = useRouter();

  const { commentsInputRef } = EcencyClientServerBridge.useSafeContext(EntryPageContext);

  const { mutateAsync: updateReplyApi, isPending: isUpdateReplyLoading } = useUpdateReply(
    entry,
    () => {
      router.push(entry.url);
      // reload(); TODO
    }
  );
  const updateReply = async (text: string) => {
    if (entry) {
      return updateReplyApi({
        text,
        point: true,
        jsonMeta: makeJsonMetaDataReply(entry.json_metadata.tags || ["ecency"], appPackage.version)
      });
    }
    return;
  };

  return (
    <Comment
      defText={entry.body}
      submitText={i18next.t("g.update")}
      entry={entry}
      onSubmit={updateReply}
      cancellable={true}
      onCancel={() => router.back()}
      inProgress={isUpdateReplyLoading}
      autoFocus={true}
      inputRef={commentsInputRef}
    />
  );
}
