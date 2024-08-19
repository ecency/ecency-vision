import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useGlobalStore } from "@/core/global-store";
import { getAccountFullQuery } from "@/api/queries";

interface Props {
  username: string;
}

export function ProfilePreviewAvatar({ username }: Props) {
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);

  const { data: profile, isLoading: isProfileLoading } =
    getAccountFullQuery(username).useClientQuery();

  return (
    <div className="flex items-center flex-col text-center -mt-12">
      <div
        className={`rounded-[50%] mb-3 profile-img-container ${
          profile && profile.profile?.profile_image ? "" : "no-image"
        }`}
      >
        {isProfileLoading ? (
          <div className="animate-pulse w-[96px] h-[96px] border border-[--border-color] rounded-full bg-blue-dark-sky-040" />
        ) : (
          profile && (
            <Link href={`/@${username}`}>
              <Image
                width={1000}
                height={1000}
                src={`https://images.ecency.com/${
                  canUseWebp ? "webp/" : ""
                }u/${username}/avatar/medium`}
                alt="img"
                className="w-[96px] h-[96px] rounded-full bg-primary"
                loading="lazy"
              />
            </Link>
          )
        )}
      </div>
    </div>
  );
}
