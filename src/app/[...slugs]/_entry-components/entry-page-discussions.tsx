"use client";

import { Comment, Discussion } from "@/features/shared";
import i18next from "i18next";
import { Entry } from "@/entities";
import { useMemo, useState } from "react";
import { useGlobalStore } from "@/core/global-store";
import { CommentEngagement } from "@/app/[...slugs]/_entry-components/comment-engagement";
import { useSearchParams } from "next/navigation";
import { EcencyClientServerBridge } from "@/core/client-server-bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components/context";
import { createReplyPermlink, makeJsonMetaDataReply } from "@/utils";
import appPackage from "../../../../package.json";
import { useCreateReply } from "@/api/mutations";
import { getCommunityCache } from "@/core/caches";

interface Props {
  entry: Entry;
  category: string;
}

export function EntryPageDiscussions({ entry, category }: Props) {
  const params = useSearchParams();

  const { commentsInputRef, selection } = EcencyClientServerBridge.useSafeContext(EntryPageContext);

  const activeUser = useGlobalStore((s) => s.activeUser);
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  const [isCommented, setIsCommented] = useState(false);

  const { data: community } = getCommunityCache(category).useClientQuery();
  const isRawContent = useMemo(() => usePrivate && !!params.get("raw"), [params, usePrivate]);

  const { mutateAsync: createReply, isPending: isCreateReplyLoading } = useCreateReply(
    entry,
    undefined,
    () => {
      setIsCommented(true);
    }
  );

  const replySubmitted = async (text: string) => {
    const permlink = createReplyPermlink(entry!.author);
    const tags = entry!.json_metadata.tags || ["ecency"];

    return createReply({
      jsonMeta: makeJsonMetaDataReply(tags, appPackage.version),
      text,
      permlink,
      point: true
    });
  };

  return (
    <>
      <Comment
        defText={selection}
        submitText={i18next.t("g.reply")}
        entry={entry}
        onSubmit={replySubmitted}
        isCommented={isCommented}
        inProgress={isCreateReplyLoading}
        inputRef={commentsInputRef}
      />

      {activeUser && entry.children === 0 && <CommentEngagement />}

      <Discussion
        parent={entry}
        community={community!!}
        hideControls={false}
        isRawContent={isRawContent}
      />
    </>
  );
}
