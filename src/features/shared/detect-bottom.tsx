"use client";

import { useInViewport } from "react-in-viewport";
import { useEffect, useRef } from "react";

interface Props {
  onBottom: () => any;
}

export function DetectBottom({ onBottom }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { inViewport } = useInViewport(ref);

  useEffect(() => {
    if (inViewport) {
      onBottom();
    }
  }, [inViewport, onBottom]);

  return <div ref={ref} />;
}
