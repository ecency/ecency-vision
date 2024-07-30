"use client";

import { EcencyClientServerBridge } from "@/core/client-server-bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components/context";
import { PropsWithChildren } from "react";
import { Entry } from "@/entities";

export function EntryPageViewerManager(props: PropsWithChildren<{ entry: Entry }>) {
  const { isRawContent } = EcencyClientServerBridge.useSafeContext(EntryPageContext);

  return isRawContent ? (
    <pre className="entry-body markdown-view user-selectable font-mono bg-gray-100 rounded text-sm !p-4 dark:bg-gray-900">
      {props.entry.body}
    </pre>
  ) : (
    props.children
  );
}
