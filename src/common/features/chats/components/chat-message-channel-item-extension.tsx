import { Popover, PopoverContent } from "@ui/popover";
import React, { PropsWithChildren, RefObject, useMemo, useRef } from "react";
import FollowControls from "../../../components/follow-controls";
import { Button } from "@ui/button";
import { _t } from "../../../i18n";
import ChatInput from "./chat-input";
import UserAvatar from "../../../components/user-avatar";
import { useMappedStore } from "../../../store/use-mapped-store";
import { COMMUNITYADMINROLES } from "./chat-popup/chat-constants";
import {
  Channel,
  CommunityModerator,
  useNostrGetUserProfileQuery,
  useUpdateChannelBlockedUsers
} from "@ecency/ns-query";

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

  const { data: nostrUserProfiles } = useNostrGetUserProfileQuery(creator);

  const profile = useMemo(
    () => nostrUserProfiles?.find((p) => p.creator === creator),
    [creator, nostrUserProfiles]
  );
  const communityAdmins = useMemo(
    () =>
      currentChannel?.communityModerators
        ?.filter((user: CommunityModerator) => COMMUNITYADMINROLES.includes(user.role))
        .map((user: CommunityModerator) => user.name) ?? [],
    [currentChannel]
  );

  const { mutateAsync: updateBlockedUsers } = useUpdateChannelBlockedUsers(currentChannel);

  const block = (removedUserId: string) =>
    updateBlockedUsers([...(currentChannel.removedUserIds ?? []), removedUserId]);

  const unBlock = (removedUserId: string) =>
    updateBlockedUsers(
      currentChannel.removedUserIds?.filter((item) => item !== removedUserId) ?? []
    );

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
                  communityAdmins.includes(activeUser?.username!) &&
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

                {communityAdmins.includes(activeUser?.username!) &&
                  profile?.name !== currentChannel.communityName && (
                    <>
                      {currentChannel?.removedUserIds?.includes(profile?.creator ?? "") ? (
                        <>
                          <Button onClick={() => unBlock(profile?.creator ?? "")}>
                            {_t("chat.unblock")}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={() => block(profile?.creator ?? "")}>
                            {_t("chat.block")}
                          </Button>
                        </>
                      )}
                    </>
                  )}
              </div>

              <ChatInput currentChannel={currentChannel} currentUser="" />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
