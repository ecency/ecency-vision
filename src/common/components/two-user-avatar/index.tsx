import React, { Component } from "react";

import { Global } from "../../store/global/types";

import defaults from "../../constants/defaults.json";
import "./_index.scss";

interface Props {
  global: Global;
  from: string;
  to: string;
  size?: string;
}

export class TwoUserAvatar extends Component<Props> {
  render() {
    const { from, to, size, global } = this.props;
    const imgSize =
      size === "xLarge" ? "large" : size === "normal" || size === "small" ? "small" : "medium";
    const cls = `two-user-avatar ${size}`;
    const imageSrc1 = `${defaults.imageServer}${
      global?.canUseWebp ? "/webp" : ""
    }/u/${from}/avatar/${imgSize}`;
    const imageSrc2 = `${defaults.imageServer}${
      global?.canUseWebp ? "/webp" : ""
    }/u/${to}/avatar/${imgSize}`;

    return (
      <div className="route flex">
        <span className={cls} style={{ backgroundImage: `url(${imageSrc1})` }} />
        <span className={cls} style={{ backgroundImage: `url(${imageSrc2})` }} />
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    global: p.global,
    from: p.from,
    to: p.to,
    size: p.size
  };

  return <TwoUserAvatar {...props} />;
};
