import React from "react";
import { useUserActivity } from "../api/mutations";
import useInterval from "react-use/lib/useInterval";
import { useMappedStore } from "../store/use-mapped-store";
import { useTimeoutFn } from "react-use";

export function UserActivityRecorder() {
  const { activeUser } = useMappedStore();
  const { mutate } = useUserActivity(activeUser?.username, 10);

  useTimeoutFn(() => mutate(undefined), 5000);

  useInterval(() => mutate(undefined), 1000 * 60 * 15 + 8);

  return <></>;
}
