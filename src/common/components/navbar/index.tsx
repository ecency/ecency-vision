import React, { Component } from "react";

import { History } from "history";

import { Button } from "react-bootstrap";

import { Link } from "react-router-dom";

import isEqual from "react-fast-compare";

import { Global, Theme } from "../../store/global/types";

import ToolTip from "../tooltip";
import DownloadTrigger from "../download-trigger";
import Search from "../search";

import { _t } from "../../i18n";

import { brightnessSvg, appleSvg, googleSvg, desktopSvg, pencilOutlineSvg } from "../../img/svg";

interface Props {
  history: History;
  global: Global;
  toggleTheme: () => void;
}

export default class NavBar extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return !isEqual(this.props.global, nextProps.global);
  }

  changeTheme = () => {
    this.props.toggleTheme();
  };

  render() {
    const { global } = this.props;
    const themeText = global.theme == Theme.day ? _t("navbar.night-theme") : _t("navbar.day-theme");
    return (
      <div className="nav-bar">
        <div className="nav-bar-inner">
          <Link to="/" className="brand" />
          <div className="text-menu">
            <Link className="menu-item" to="/">
              {_t("navbar.global")}
            </Link>
            <Link className="menu-item" to="/communities">
              {_t("navbar.communities")}
            </Link>
            <Link className="menu-item" to="/about">
              {_t("navbar.about")}
            </Link>
          </div>
          <div className="flex-spacer" />
          <div className="search-bar">
            <Search {...this.props} />
          </div>
          <DownloadTrigger>
            <div className="downloads">
              <span className="label">{_t("g.downloads")}</span>
              <span className="icons">
                <span className="img-apple">{appleSvg}</span>
                <span className="img-google">{googleSvg}</span>
                <span className="img-desktop">{desktopSvg}</span>
              </span>
            </div>
          </DownloadTrigger>
          <div className="login-required">
            <Button variant="outline-primary">{_t("g.login")}</Button>
            <Button variant="primary">{_t("g.signup")}</Button>
            <ToolTip content={_t("navbar.post")}>
              <Link className="btn btn-outline-primary" to="/submit">{pencilOutlineSvg}</Link>
            </ToolTip>
          </div>
          <ToolTip content={themeText}>
            <div className="switch-theme" onClick={this.changeTheme}>
              {brightnessSvg}
            </div>
          </ToolTip>
        </div>
      </div>
    );
  }
}
