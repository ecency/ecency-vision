import { useState } from "react";
import useMount from "react-use/lib/useMount";

/**
 * Retrieves a list of available cameras.
 *
 * @return {MediaDeviceInfo[]} The list of available cameras.
 */
export function useGetCameraList() {
  const [list, setList] = useState<MediaDeviceInfo[]>([]);

  useMount(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setList(devices.filter(({ kind }) => kind === "videoinput"));
  });

  return list;
}
