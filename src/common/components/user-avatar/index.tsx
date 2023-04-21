import React, { Component } from "react";

import { Global } from "../../store/global/types";

import defaults from "../../constants/defaults.json";
import { proxifyImageSrc } from "@ecency/render-helper";
import { useMappedStore } from "../../store/use-mapped-store";
import "./_index.scss";

interface Props {
  global: Global;
  username: string;
  size?: string;
  src?: string;
  onClick?: () => void;
}

export class UserAvatar extends Component<Props> {
  render() {
    const { username, size, global, src } = this.props;
    const imgSize =
      size === "xLarge" ? "large" : size === "normal" || size === "small" ? "small" : "medium";
    const cls = `user-avatar ${size}`;
    const imageSrc =
      proxifyImageSrc(src, 0, 0, global?.canUseWebp ? "webp" : "match") ||
      `${defaults.imageServer}${global?.canUseWebp ? "/webp" : ""}/u/${username}/avatar/${imgSize}`;

    return (
      <span
        onClick={() => (this.props.onClick ? this.props.onClick() : (() => {})())}
        className={cls}
        style={{ backgroundImage: `url(${imageSrc})` }}
      />
    );
  }
}

export default (p: Omit<Props, "global">) => {
  const { global } = useMappedStore();

  const props = {
    global,
    username: p.username,
    size: p.size,
    src: p.src
  };

  return <UserAvatar {...props} />;
};
