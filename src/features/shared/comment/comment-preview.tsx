import React from "react";
import { renderPostBody } from "@ecency/render-helper";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  text: string;
}

export function CommentPreview({ text }: Props) {
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);

  if (text === "") {
    return <></>;
  }

  return (
    <div className="comment-preview mt-4 rounded-2xl bg-gray-100 dark:bg-dark-200 p-4">
      <div className="uppercase tracking-wider text-xs font-bold opacity-50 mb-4">
        {i18next.t("comment.preview")}
      </div>
      <div
        className="preview-body markdown-view"
        dangerouslySetInnerHTML={{ __html: renderPostBody(text, false, canUseWebp) }}
      />
    </div>
  );
}
