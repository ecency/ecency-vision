"use client";

import { ListStyle } from "@/enums";
import { PropsWithChildren } from "react";
import { useGlobalStore } from "@/core/global-store";

export function ProfileEntriesLayout(props: PropsWithChildren) {
  const listStyle = useGlobalStore((s) => s.listStyle);

  return (
    <div className="entry-list">
      <div className={`entry-list-body ${listStyle === ListStyle.grid ? "grid-view" : ""}`}>
        {props.children}
      </div>
    </div>
  );
}
