"use client";

import { ListStyle } from "@/enums";
import { PropsWithChildren } from "react";
import { useGlobalStore } from "@/core/global-store";
import { usePostsFeedQuery } from "@/api/queries";
import { LinearProgress } from "@/features/shared";
import { isCommunity } from "@/utils";

interface Props {
  username: string;
  section: string;
}

export function ProfileEntriesLayout(props: PropsWithChildren<Props>) {
  const listStyle = useGlobalStore((s) => s.listStyle);
  const { isLoading } = usePostsFeedQuery(
    props.section,
    isCommunity(props.username) ? props.username : `@${props.username}`
  );

  return (
    <div className="entry-list">
      <div className={`entry-list-body ${listStyle === ListStyle.grid ? "grid-view" : ""}`}>
        {isLoading && <LinearProgress />}
        {props.children}
      </div>
    </div>
  );
}
