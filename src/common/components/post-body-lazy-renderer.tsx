import React, { useEffect, useState } from "react";
import { renderPostBody } from "@ecency/render-helper";
import md5 from "js-md5";
import { useMappedStore } from "../store/use-mapped-store";

interface Props {
  rawBody: string;
  className?: string;
}

interface Line {
  element: Element;
  hash: string;
}

export function PostBodyLazyRenderer({ rawBody, className }: Props) {
  const [lines, setLines] = useState<Line[]>([]);
  const { global } = useMappedStore();

  useEffect(() => {
    lazyBuild();
  }, []);
  useEffect(() => {
    lazyBuild();
  }, [rawBody]);

  const lazyBuild = () => {
    const renderedBody = renderPostBody(rawBody, false, global.canUseWebp);
    const tree = document.createElement("div");
    tree.innerHTML = renderedBody;

    const nextLines: Line[] = [];

    for (let i = 0; i < tree.children.length; i++) {
      const element = tree.children.item(i)!!;

      const hash = md5(element.outerHTML + `index-${i}`);

      nextLines.push({ element, hash });
    }

    setLines(nextLines);
  };

  return (
    <div className={className}>
      {lines.map(({ element, hash }) => (
        <div key={hash} dangerouslySetInnerHTML={{ __html: element.outerHTML }} />
      ))}
    </div>
  );
}
