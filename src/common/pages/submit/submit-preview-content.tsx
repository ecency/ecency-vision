import Tag from "../../components/tag";
import { PostBodyLazyRenderer } from "../../components/post-body-lazy-renderer";
import React, { useMemo } from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import { History } from "history";
import { useThreeSpeakManager } from "./hooks";
import { SubmitPollPreview } from "./submit-poll-preview";

interface Props {
  title: string;
  tags: string[];
  body: string;
  history: History;
}

export function SubmitPreviewContent({ title, tags, body, history }: Props) {
  const { global } = useMappedStore();
  const { buildBody } = useThreeSpeakManager();

  const modifiedBody = useMemo(() => buildBody(body), [body]);

  return (
    <>
      <div className="preview-title">{title}</div>

      <div className="preview-tags">
        {tags.map((x) => {
          return (
            <span className="preview-tag" key={x}>
              <Tag tag={x} type="span" global={global} history={history}>
                <span>{x}</span>
              </Tag>
            </span>
          );
        })}
      </div>

      <div className="preview-body markdown-view">
        <PostBodyLazyRenderer rawBody={modifiedBody} />
        <SubmitPollPreview />
      </div>
    </>
  );
}
