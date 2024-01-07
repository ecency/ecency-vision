import React, { useMemo } from "react";
import { proxifyImageSrc, setProxyBase } from "@ecency/render-helper";
import "./_index.scss";
import { useGlobalStore } from "@/core/global-store";
import defaults from "@/defaults.json";

setProxyBase(defaults.imageServer);

interface Props {
  username: string;
  size?: string;
  src?: string;
  onClick?: () => void;
}

export function UserAvatar({ username, size, src, onClick }: Props) {
  const canUseWebp = useGlobalStore((state) => state.canUseWebp);

  const imgSize = useMemo(
    () =>
      size === "xLarge" ? "large" : size === "normal" || size === "small" ? "small" : "medium",
    [size]
  );
  const imageSrc = useMemo(
    () =>
      proxifyImageSrc(src, 0, 0, canUseWebp ? "webp" : "match") ||
      `"https://images.ecency.com"${canUseWebp ? "/webp" : ""}/u/${username}/avatar/${imgSize}`,
    [imgSize, src, canUseWebp, username]
  );

  return (
    <span
      onClick={onClick ?? (() => {})}
      className={`user-avatar ${size}`}
      style={{ backgroundImage: `url(${imageSrc})` }}
    />
  );
}
