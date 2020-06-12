import React, { Component } from "react";

import { Link } from "react-router-dom";

import { FormControl } from "react-bootstrap";

import ToolTip from "../tooltip";
import DownloadTrigger from "../download-trigger";
import SearchBox from "../search-box";

import { _t } from "../../i18n";

import { magnifySvg, brightnessSvg, appleSvg, googleSvg, desktopSvg } from "../../img/svg";

interface Props {
  toggleTheme: () => void;
}

export default class NavBar extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
    return false;
  }

  changeTheme = () => {
    this.props.toggleTheme();
  };

  render() {
    return (
      <div className="nav-bar">
        <div className="nav-bar-inner">
          <Link to="/" className="brand">
            {/* <span className="brand-text">ecency</span> */}
          </Link>
          <div className="text-menu">
            <Link className="menu-item" to="/">
              Global
            </Link>
            <Link className="menu-item" to="/communities">
              Communities
            </Link>
            <Link className="menu-item" to="/about">
              About
            </Link>
          </div>
          <div className="flex-spacer" />
          <div className="search-bar">
            <SearchBox placeholder={_t("g.search")} />
          </div>
          <DownloadTrigger>
            <div className="downloads">
              <span className="label">Downloads</span>
              <span className="icons">
                <span className="img-apple">{appleSvg}</span>
                <span className="img-google">{googleSvg}</span>
                <span className="img-desktop">{desktopSvg}</span>
              </span>
            </div>
          </DownloadTrigger>
          <div className="switch-theme" onClick={this.changeTheme}>
            <ToolTip content={_t("navbar.change-theme")} placement="left">
              {brightnessSvg}
            </ToolTip>
          </div>
        </div>
      </div>
    );
  }
}
