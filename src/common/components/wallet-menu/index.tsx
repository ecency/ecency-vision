import React, { Component } from "react";

import { Link } from "react-router-dom";

import { Global } from "../../store/global/types";

import _c from "../../util/fix-class-names";

import { hiveSvg, spkSvg } from "../../img/svg";
import { hiveEngineSvg } from "../../img/svg";
import "./_index.scss";

interface Props {
  global: Global;
  username: string;
  active: string;
}

export default class WalletMenu extends Component<Props> {
  render() {
    const { global, username, active } = this.props;
    const logo = require("../../img/logo-small-transparent.png");

    return (
      <div className="wallet-menu">
        {global.usePrivate && (
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
        )}
        <Link
          className={_c(`menu-item hive ${active === "hive" ? "active" : ""}`)}
          to={`/@${username}/wallet`}
        >
          <span className="title">Hive</span>
          <span className="sub-title">Wallet</span>
          <span className="platform-logo">{hiveSvg}</span>
        </Link>
        <Link
          className={_c(`menu-item hive-engine ${active === "engine" ? "active" : ""}`)}
          to={`/@${username}/engine`}
        >
          <span className="title">Engine</span>
          <span className="sub-title">Tokens</span>
          <span className="platform-logo">{hiveEngineSvg}</span>
        </Link>
        <Link
          className={_c(`menu-item spk ${active === "spk" ? "active" : ""}`)}
          to={`/@${username}/spk`}
        >
          <span className="title">SPK</span>
          <span className="sub-title">Tokens</span>
          <span className="platform-logo">{spkSvg}</span>
        </Link>
      </div>
    );
  }
}
