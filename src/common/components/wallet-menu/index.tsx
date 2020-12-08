import React, {Component} from "react";

import {Link} from "react-router-dom";

const logo = require('../../img/logo-small-transparent.png');


import _c from "../../util/fix-class-names";

import {hiveSvg} from "../../img/svg";


interface Props {
    username: string;
    active: string;
}

export default class WalletMenu extends Component<Props> {
    render() {
        const {username, active} = this.props;

        return (
            <div className="wallet-menu">
                <Link className={_c(`menu-item hive ${active === "hive" ? "active" : ""}`)} to={`/@${username}/wallet`}>
                    <span className="title">Hive</span>
                    <span className="sub-title">Wallet</span>
                    <span className="platform-logo">{hiveSvg}</span>
                </Link>
                <Link className={_c(`menu-item ecency ${active === "ecency" ? "active" : ""}`)} to={`/@${username}/points`}>
                    <span className="title">Ecency</span>
                    <span className="sub-title">Points</span>
                    <span className="platform-logo"><img alt="ecency" src={logo}/></span>
                </Link>
            </div>
        );
    }
}

