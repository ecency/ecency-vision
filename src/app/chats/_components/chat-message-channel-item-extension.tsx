import { Popover, PopoverContent } from "@ui/popover";
import React, { PropsWithChildren, RefObject, useMemo, useRef } from "react";
import { Channel, useNostrGetUserProfileQuery } from "@ecency/ns-query";
import { getCommunityCache } from "@/core/caches";
import Link from "next/link";
import { FollowControls, UserAvatar } from "@/features/shared";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  currentChannel: Channel;
  creator: string;
}

export function ChatMessageChannelItemExtension({
  currentChannel,
  children,
  creator
}: PropsWithChildren<Props>) {
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const activeUser = useGlobalStore((state) => state.activeUser);
  const { data: community } = getCommunityCache(currentChannel?.communityName).useClientQuery();
  const { data: nostrUserProfiles } = useNostrGetUserProfileQuery(creator);

  const profile = useMemo(
    () => nostrUserProfiles?.find((p) => p.creator === creator),
    [creator, nostrUserProfiles]
  );
  const communityTeam = useMemo(() => community?.team.map(([name]) => name) ?? [], [community]);

  return (
    <>
      <Link href={`@${profile?.name ?? ""}`}>
        <UserAvatar username={profile?.name ?? ""} size="w-[2rem] h-[2rem]" />
      </Link>
      <Popover id="profile-popover" className="profile-popover">
        {children}
        <PopoverContent>
          <div className="profile-box" ref={popoverRef as RefObject<HTMLDivElement>}>
            <div className="profile-box-content">
              <div className="profile-box-logo flex justify-center">
                <UserAvatar username={profile?.name ?? ""} size="large" />
              </div>

              <p className="flex justify-center profile-name">{`@${profile?.name}`}</p>
              <div
                className={`flex mb-3 ${
                  communityTeam.includes(activeUser?.username!) &&
                  profile?.name !== currentChannel.communityName
                    ? "justify-between"
                    : "justify-center"
                }  profile-box-buttons`}
              >
                <FollowControls targetUsername={profile?.name ?? ""} where="chat-box" />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
