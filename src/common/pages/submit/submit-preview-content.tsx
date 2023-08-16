import Tag from "../../components/tag";
import { PostBodyLazyRenderer } from "../../components/post-body-lazy-renderer";
import React from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import { History } from "history";

interface Props {
  title: string;
  tags: string[];
  body: string;
  history: History;
}

export function SubmitPreviewContent({ title, tags, body, history }: Props) {
  const { global } = useMappedStore();

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

      <PostBodyLazyRenderer className="preview-body markdown-view" rawBody={body} />
    </>
  );
}
