"use client";

import React, { cloneElement, ReactElement } from "react";
import { Entry } from "@/entities";
import { PopoverConfirm } from "@/features/ui";
import { useDeleteComment } from "@/api/mutations";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactElement & { className?: string };
  entry: Entry;
  parent?: Entry;
  onSuccess?: () => void;
  setDeleteInProgress?: (value: boolean) => void;
  isComment?: boolean;
}
export function EntryDeleteBtn({ children, entry, parent }: Props) {
  const router = useRouter();
  const { mutateAsync: deleteAction, isPending } = useDeleteComment(
    entry,
    () => router.push("/"),
    parent
  );

  const child = cloneElement(children, {
    className: `${children.className ? children.className.replace("in-progress", "") : ""} ${
      isPending ? "in-progress" : ""
    }`
  });

  if (isPending) {
    return child;
  }

  return <PopoverConfirm onConfirm={deleteAction}>{child}</PopoverConfirm>;
}
