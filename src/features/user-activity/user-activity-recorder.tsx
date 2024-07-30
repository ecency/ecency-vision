import React from "react";
import useInterval from "react-use/lib/useInterval";
import { useTimeoutFn } from "react-use";
import { useGlobalStore } from "@/core/global-store";
import { useUserActivity } from "@/api/mutations";

export function UserActivityRecorder() {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { mutate } = useUserActivity(activeUser?.username, 10);

  useTimeoutFn(() => mutate(undefined), 5000);

  useInterval(() => mutate(undefined), 1000 * 60 * 15 + 8);

  return <></>;
}
