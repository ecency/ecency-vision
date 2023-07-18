import React, { useEffect, useState } from "react";
import { renderPostBody } from "@ecency/render-helper";
import md5 from "js-md5";

interface Props {
  rawBody: string;
  className?: string;
}

export function PostBodyLazyRenderer({ rawBody, className }: Props) {
  const [result, setResult] = useState<Element[]>([]);
  const [hashes, setHashes] = useState<string[]>([]);

  useEffect(() => {
    lazyBuild();
  }, []);
  useEffect(() => {
    lazyBuild();
  }, [rawBody]);

  const lazyBuild = () => {
    const renderedBody = renderPostBody(rawBody);
    const tree = document.createElement("div");
    tree.innerHTML = renderedBody;

    const nextHashes: string[] = [];
    const linesToRender: number[] = [];
    const nextLines: Element[] = [];

    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children.item(i)!!;

      const hash = md5(child.innerHTML);
      const existingHash = hashes[i];

      if (hash !== existingHash) {
        linesToRender.push(i);
      }

      nextHashes.push(hash);
      nextLines.push(child);
    }

    setHashes(nextHashes);
    setResult(nextLines);
  };

  return (
    <div className={className}>
      {result.map((line, i) => (
        <p key={hashes[i]} dangerouslySetInnerHTML={{ __html: line.innerHTML }} />
      ))}
    </div>
  );
}
