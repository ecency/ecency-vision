import React, { useMemo } from "react";
import { renderPostBody } from "@ecency/render-helper";
import { Entry } from "@/entities";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  entry: Entry;
  isRawContent: boolean;
}

export function DiscussionItemBody({ entry, isRawContent }: Props) {
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);
  const renderedBody = useMemo(
    () => ({ __html: renderPostBody(entry.body, false, canUseWebp) }),
    [canUseWebp, entry]
  );

  return (
    <>
      {!isRawContent ? (
        <div
          className="item-body markdown-view mini-markdown"
          dangerouslySetInnerHTML={renderedBody}
        />
      ) : (
        <pre className="item-body markdown-view mini-markdown">{entry.body}</pre>
      )}
    </>
  );
}
