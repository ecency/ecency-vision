"use client";
import React, { useEffect } from "react";
import { Account } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import Link from "next/link";
import i18next from "i18next";
import { useRouter } from "next/navigation";
import { ProfileEdit } from "./profile-edit";
import { Preferences } from "./preferences";

interface Props {
  account: Account;
}

export function ProfileSettings({ account }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const router = useRouter();

  useEffect(() => {
    if (!activeUser || activeUser.username !== account.name) {
      router.push(`/@${account.name}`);
    }
  }, [account.name, activeUser, router]);

  return (
    <>
      {activeUser && (
        <>
          {activeUser.data.__loaded && <ProfileEdit />}
          <Preferences />
          {activeUser && activeUser.username && (
            <Link href={`/@${activeUser.username}/permissions`}>
              <h5>{i18next.t("g.permissions")}</h5>
            </Link>
          )}
        </>
      )}
    </>
  );
}
