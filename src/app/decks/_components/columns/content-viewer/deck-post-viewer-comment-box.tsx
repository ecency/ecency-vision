import React, { useState } from "react";
import { Entry } from "@/entities";
import { useLocation } from "react-use";
import { useCreateReply } from "@/api/mutations";
import { useGlobalStore } from "@/core/global-store";
import { createReplyPermlink, makeJsonMetaDataReply } from "@/utils";
import appPackage from "../../../../../../package.json";
import i18next from "i18next";
import { Comment } from "@/features/shared";

interface Props {
  entry: Entry;
  onReplied: () => void;
}

export const DeckPostViewerCommentBox = ({ entry, onReplied }: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const location = useLocation();

  const [isReplying, setIsReplying] = useState(false);
  const [isCommented, setIsCommented] = useState(false);

  const { mutateAsync: createReply } = useCreateReply(entry, undefined, () => {
    onReplied();
    setIsCommented(true);
    setIsReplying(false);
  });

  const submitReply = async (text: string) => {
    if (!activeUser || !activeUser.data.__loaded) {
      return;
    }

    const permlink = createReplyPermlink(entry.author);
    const tags = entry.json_metadata.tags || ["ecency"];

    const jsonMeta = makeJsonMetaDataReply(tags, appPackage.version);

    setIsReplying(true);

    return createReply({ jsonMeta, text, permlink, point: true });
  };
  return (
    <Comment
      defText=""
      submitText={i18next.t("g.reply")}
      entry={entry}
      onSubmit={submitReply}
      isCommented={isCommented}
      inProgress={isReplying}
    />
  );
};
