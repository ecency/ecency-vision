"use client";

import React, { useCallback, useEffect, useRef } from "react";
import mediumZoom, { Zoom } from "medium-zoom";
import { Entry } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { Theme } from "@/enums";
import useMount from "react-use/lib/useMount";
import { injectTwitter } from "@/utils/twitter";
import useUnmount from "react-use/lib/useUnmount";

interface Props {
  entry: Entry;
}

export function EntryBodyExtra({ entry }: Props) {
  const zoomRef = useRef<Zoom>();

  const theme = useGlobalStore((s) => s.theme);

  const setBackground = useCallback(() => {
    if (theme === Theme.day) {
      zoomRef.current?.update({ background: "#ffffff" });
    } else {
      zoomRef.current?.update({ background: "#131111" });
    }
  }, [theme]);

  useMount(() => {
    // Tweet renderer
    if (/(?:https?:\/\/(?:(?:twitter\.com\/(.*?)\/status\/(\d+)$)))/gim.test(entry.body)) {
      injectTwitter();
    }

    // Medium style image zoom
    const elements: HTMLElement[] = [
      ...Array.from(document.querySelectorAll<HTMLElement>(".entry-body img"))
    ].filter((x) => x.parentNode?.nodeName !== "A");
    zoomRef.current = mediumZoom(elements);
    setBackground();
  });

  useUnmount(() => zoomRef.current?.detach());

  useEffect(() => {
    setBackground();
  }, [setBackground, theme]);
  return <></>;
}
