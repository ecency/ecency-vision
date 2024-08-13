"use client";

import React, { useCallback, useMemo } from "react";
import { Button } from "@ui/button";
import { useGetRelationshipBtwAccounts } from "@/api/queries";
import { useGlobalStore } from "@/core/global-store";
import { useFollow, useIgnore } from "@/api/mutations";
import i18next from "i18next";
import { LoginRequired } from "@/features/shared";

interface Props {
  targetUsername: string;
  where?: string;
}

interface ButtonProps {
  disabled: boolean;
  following: string;
}

function MuteButton({ disabled, following }: ButtonProps) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const { mutateAsync: ignore } = useIgnore(activeUser?.username, following);

  return activeUser?.username !== following ? (
    <LoginRequired>
      <Button size="sm" style={{ marginRight: "5px" }} disabled={disabled} onClick={() => ignore()}>
        {i18next.t("follow-controls.mute")}
      </Button>
    </LoginRequired>
  ) : (
    <></>
  );
}

function FollowButton({ disabled, following }: ButtonProps) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const { mutateAsync: followApiRequest } = useFollow(activeUser!.username, following);
  const follow = useCallback(() => followApiRequest({ isFollow: true }), [followApiRequest]);

  return activeUser?.username !== following ? (
    <LoginRequired>
      <Button size="sm" style={{ marginRight: "5px" }} disabled={disabled} onClick={follow}>
        {i18next.t("follow-controls.follow")}
      </Button>
    </LoginRequired>
  ) : (
    <></>
  );
}

function UnFollowButton({ disabled, following }: ButtonProps) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const { mutateAsync: followApiRequest, isPending } = useFollow(activeUser!.username, following);
  const unFollow = useCallback(() => followApiRequest({ isFollow: false }), [followApiRequest]);

  return (
    <LoginRequired>
      <Button size="sm" style={{ marginRight: "5px" }} disabled={disabled} onClick={unFollow}>
        {i18next.t("follow-controls.unFollow")}
      </Button>
    </LoginRequired>
  );
}

export function FollowControls({ where, targetUsername }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const { data, isLoading } = useGetRelationshipBtwAccounts(activeUser?.username, targetUsername);

  const showFollow = useMemo(
    () => data?.follows === false || isLoading,
    [data?.follows, isLoading]
  );
  const showUnFollow = useMemo(() => data?.follows === true, [data]);
  const showMute = useMemo(() => isLoading || where !== "chat-box", [isLoading, where]);

  return (
    <>
      {showUnFollow && <UnFollowButton disabled={isLoading} following={targetUsername} />}
      {showFollow && <FollowButton disabled={isLoading} following={targetUsername} />}
      {showMute && <MuteButton disabled={isLoading} following={targetUsername} />}
    </>
  );
}
