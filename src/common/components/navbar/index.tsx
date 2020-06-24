import React, { Component } from "react";

import { History, Location } from "history";

import { Button } from "react-bootstrap";

import { Link } from "react-router-dom";

import isEqual from "react-fast-compare";

import { Global, Theme } from "../../store/global/types";
import { TrendingTags } from "../../store/trending-tags/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";

import ToolTip from "../tooltip";
import DownloadTrigger from "../download-trigger";
import Search from "../search";
import LoginRequired from "../login-required";
import UserNav from "../user-nav";

import { _t } from "../../i18n";

import { brightnessSvg, appleSvg, googleSvg, desktopSvg, pencilOutlineSvg } from "../../img/svg";

interface Props {
  history: History;
  location: Location;
  global: Global;
  trendingTags: TrendingTags;
  users: User[];
  activeUser: ActiveUser | null;
  fetchTrendingTags: () => void;
  toggleTheme: () => void;
  setActiveUser: (name: string | null) => void;
  deleteUser: (username: string) => void;
}

export default class NavBar extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return (
      !isEqual(this.props.global, nextProps.global) ||
      !isEqual(this.props.trendingTags, nextProps.trendingTags) ||
      !isEqual(this.props.users, nextProps.users) ||
      !isEqual(this.props.activeUser, nextProps.activeUser)
    );
  }

  changeTheme = () => {
    this.props.toggleTheme();
  };

  render() {
    const { global, activeUser } = this.props;
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
          <ToolTip content={themeText}>
            <div className="switch-theme" onClick={this.changeTheme}>
              {brightnessSvg}
            </div>
          </ToolTip>
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

          {!activeUser && (
            <div className="login-required">
              <LoginRequired {...this.props}>
                <Button variant="outline-primary">{_t("g.login")}</Button>
              </LoginRequired>
              <Button variant="primary">{_t("g.signup")}</Button>
            </div>
          )}

          <div className="submit-post">
            <ToolTip content={_t("navbar.post")}>
              <Link className="btn btn-outline-primary" to="/submit">
                {pencilOutlineSvg}
              </Link>
            </ToolTip>
          </div>

          {activeUser && <UserNav {...this.props} activeUser={activeUser} />}
        </div>
      </div>
    );
  }
}
