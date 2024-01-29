import { Popover, PopoverContent } from "@ui/popover";
import React, { PropsWithChildren, RefObject, useMemo, useRef } from "react";
import FollowControls from "../../../components/follow-controls";
import UserAvatar from "../../../components/user-avatar";
import { useMappedStore } from "../../../store/use-mapped-store";
import { Channel, useNostrGetUserProfileQuery } from "@ecency/ns-query";
import { useCommunityCache } from "../../../core";

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

  const { activeUser, setActiveUser, updateActiveUser, deleteUser, toggleUIProp, ui, users } =
    useMappedStore();

  const { data: community } = useCommunityCache(currentChannel?.communityName);
  const { data: nostrUserProfiles } = useNostrGetUserProfileQuery(creator);

  const profile = useMemo(
    () => nostrUserProfiles?.find((p) => p.creator === creator),
    [creator, nostrUserProfiles]
  );
  const communityTeam = useMemo(() => community?.team.map(([name]) => name) ?? [], [community]);

  return (
    <>
      <UserAvatar username={profile?.name ?? ""} size="w-[2rem] h-[2rem]" />
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
                <FollowControls
                  setActiveUser={setActiveUser}
                  updateActiveUser={updateActiveUser}
                  deleteUser={deleteUser}
                  toggleUIProp={toggleUIProp}
                  activeUser={activeUser}
                  targetUsername={profile?.name ?? ""}
                  where={"chat-box"}
                  ui={ui}
                  users={users}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
