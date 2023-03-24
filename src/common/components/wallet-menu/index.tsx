import React, { Component, useEffect } from "react";

import { Link } from "react-router-dom";

import { Global } from "../../store/global/types";

import _c from "../../util/fix-class-names";

import { hiveSvg, spkSvg } from "../../img/svg";
import { hiveEngineSvg } from "../../img/svg";
import { proxifyImageSrc } from "@ecency/render-helper";
import HiveEngineToken, { HiveEngineTokenEntryDelta } from "../../helper/hive-engine-wallet";

interface Props {
  global: Global;
  username: string;
  active: string;
  tokenName?: string;
  tokens?: Array<HiveEngineToken>;
}

interface ItemProps {
  global: Global;
  username: string;
  active: string;
  which: string;
  tokenName?: string;
  tokens: Array<HiveEngineToken>;
}

function WalletMenuItem(props: ItemProps) {
  const { global, username, active, which, tokenName, tokens } = props;
  const logo = global.isElectron
    ? "./img/ecency-logo-small-transparent.png"
    : require("../../img/ecency-logo-small-transparent.png");
  const tokenImageURL = (() => {
    try {
      if (!tokenName) {
        return null;
      }
      const tokenData = tokens.find((t) => t.symbol === tokenName);
      if (!tokenData) {
        return null;
      }
      const imageSrc = proxifyImageSrc(tokenData.icon, 0, 0, global?.canUseWebp ? "webp" : "match");
      return imageSrc;
    } catch (e) {
      return null;
    }
  })();

  const pobLogo = require("../../img/logo-circle.svg");

  switch (which) {
    case "points":
      return (
        global.usePrivate && (
          <Link
            className={_c(`menu-item ecency ${active === "ecency" ? "active" : ""}`)}
            to={`/@${username}/points`}
          >
            <span className="title">Ecency</span>
            <span className="sub-title">Points</span>
            <span className="platform-logo">
              <img alt="ecency" src={logo} />
            </span>
          </Link>
        )
      );
    case "pob":
      return (
        <Link
          className={_c(`menu-item hive ${active === "pob" ? "active" : ""}`)}
          to={`/@${username}/pob`}
        >
          <span className="title">Proof of Brain</span>
          <span className="sub-title">Wallet</span>
          <span className="platform-logo">
            <img alt="pob" className="platform-logo" src={pobLogo} />
          </span>
        </Link>
      );
    case "hive":
      return (
        <Link
          className={_c(`menu-item hive ${active === "hive" ? "active" : ""}`)}
          to={`/@${username}/wallet`}
        >
          <span className="title">Hive</span>
          <span className="sub-title">Wallet</span>
          <span className="platform-logo">{hiveSvg}</span>
        </Link>
      );

    case "engine":
      return (
        <Link
          className={_c(`menu-item hive-engine ${active === "engine" ? "active" : ""}`)}
          to={`/@${username}/engine`}
        >
          <span className="title">Engine</span>
          <span className="sub-title">{tokenName || "Tokens"}</span>
          <span className="platform-logo">
            <Link to={`/@${username}/engine`}>{hiveEngineSvg}</Link>{" "}
            {tokenImageURL && <img src={tokenImageURL} />}{" "}
          </span>
        </Link>
      );
    case "spk":
      return (
        <Link
          className={_c(`menu-item spk ${active === "spk" ? "active" : ""}`)}
          to={`/@${username}/spk`}
        >
          <span className="title">SPK</span>
          <span className="sub-title">Tokens</span>
          <span className="platform-logo">{spkSvg}</span>
        </Link>
      );
  }
  return <div />;
}

export default class WalletMenu extends Component<Props> {
  render() {
    const { global, tokens } = this.props;
    const { menuOrder } = global;
    return (
      <div className="wallet-menu">
        {menuOrder.map((name: string) => (
          <span key={name}>
            {WalletMenuItem({ ...this.props, which: name, tokens: tokens || [] })}
          </span>
        ))}
      </div>
    );
  }
}
