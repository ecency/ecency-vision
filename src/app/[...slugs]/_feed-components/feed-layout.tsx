"use client";

import { ListStyle } from "@/enums";
import { PropsWithChildren } from "react";
import { useGlobalStore } from "@/core/global-store";
import { usePostsFeedQuery } from "@/api/queries";
import { LinearProgress } from "@/features/shared";

interface Props {
  filter: string;
  tag: string;
}

export function FeedLayout(props: PropsWithChildren<Props>) {
  const listStyle = useGlobalStore((s) => s.listStyle);
  const { isLoading } = usePostsFeedQuery(props.filter, props.tag);

  return (
    <div className="entry-list">
      <div className={`entry-list-body ${listStyle === ListStyle.grid ? "grid-view" : ""}`}>
        {isLoading && <LinearProgress />}
        {props.children}
      </div>
    </div>
  );
}
