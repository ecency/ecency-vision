import Image from "next/image";
import React from "react";
import { useGlobalStore } from "@/core/global-store";
import { getAccountFullQuery } from "@/api/queries";

interface Props {
  username: string;
}

export function ProfilePreviewCover({ username }: Props) {
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);
  const theme = useGlobalStore((s) => s.theme);

  const { data: profile, isLoading: isProfileLoading } =
    getAccountFullQuery(username).useClientQuery();

  return isProfileLoading ? (
    <div className="animate-pulse h-[128px] w-full bg-blue-dark-sky-040" />
  ) : (
    profile && (
      <Image
        alt=""
        width={600}
        height={600}
        src={
          profile.profile?.cover_image
            ? `https://images.ecency.com/${canUseWebp ? "webp/" : ""}u/${username}/cover`
            : theme === "day"
              ? "/assets/cover-fallback-day.png"
              : "/assets/cover-fallback-night.png"
        }
        className="w-full h-[128px] object-cover"
        loading="lazy"
      />
    )
  );
}
