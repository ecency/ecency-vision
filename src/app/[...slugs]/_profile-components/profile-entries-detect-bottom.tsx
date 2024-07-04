"use client";

import { DetectBottom } from "@/features/shared";
import { usePostsFeedQuery } from "@/api/queries";
import { Account } from "@/entities";

interface Props {
  section: string;
  account: Account;
}

export function ProfileEntriesDetectBottom({ section, account }: Props) {
  const { fetchNextPage } = usePostsFeedQuery(section, `@${account.name}`);

  return <DetectBottom onBottom={() => fetchNextPage()} />;
}
