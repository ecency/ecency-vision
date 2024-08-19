import i18next from "i18next";
import Link from "next/link";
import React from "react";
import { getAccountFullQuery } from "@/api/queries";

interface Props {
  username: string;
}

export function ProfilePreviewAbout({ username }: Props) {
  const { data: profile, isLoading } = getAccountFullQuery(username).useClientQuery();

  return (
    <div className="text-sm">
      {isLoading && (
        <div className="animate-pulse h-[48px] rounded-lg w-full bg-blue-dark-sky-040" />
      )}

      {profile?.profile?.about && (
        <div className="flex flex-col gap-2 md:gap-4 p-4">
          <div className="font-bold text-xs uppercase opacity-50">
            {i18next.t("profile-edit.about")}
          </div>
          <Link href={`/@${username}`}>{profile.profile.about}</Link>
        </div>
      )}
    </div>
  );
}
