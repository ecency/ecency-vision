import React, { PropsWithChildren, useMemo } from "react";
import { Entry } from "@/entities";
import Link from "next/link";

const makePath = (category: string, author: string, permlink: string, toReplies: boolean = false) =>
  `/${category}/@${author}/${permlink}${toReplies ? "#replies" : ""}`;

export interface PartialEntry {
  category: string;
  author: string;
  permlink: string;
}

interface Props {
  entry: Entry | PartialEntry;
  afterClick?: () => void;
  target?: string;
}

export function EntryLink({ children, entry, afterClick, target }: PropsWithChildren<Props>) {
  const path = useMemo(() => makePath(entry.category, entry.author, entry.permlink), [entry]);

  return (
    <Link href={path} target={target} onClick={(e) => afterClick?.()}>
      {children}
    </Link>
  );
}
