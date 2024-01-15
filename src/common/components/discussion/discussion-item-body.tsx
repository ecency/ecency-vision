import { Entry } from "../../store/entries/types";
import React, { useMemo } from "react";
import { renderPostBody } from "@ecency/render-helper";
import { useMappedStore } from "../../store/use-mapped-store";

interface Props {
  entry: Entry;
  isRawContent: boolean;
}

export function DiscussionItemBody({ entry, isRawContent }: Props) {
  const { global } = useMappedStore();
  const renderedBody = useMemo(
    () => ({ __html: renderPostBody(entry.body, false, global.canUseWebp) }),
    [global.canUseWebp, entry]
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
