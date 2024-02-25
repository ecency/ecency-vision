import React, {Component} from "react";

import { History, Location } from "history";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import defaults from "../../constants/defaults.json";

import isEqual from "react-fast-compare";

import queryString from "query-string";

import { Global, Theme } from "../../store/global/types";
import { TrendingTags } from "../../store/trending-tags/types";
import { Account, FullAccount } from "../../store/accounts/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { UI, ToggleType } from "../../store/ui/types";
import {
  NotificationFilter,
  Notifications,
} from "../../store/notifications/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import NotificationHandler from "../notification-handler";
import SwitchLang from "../switch-lang";

import ToolTip from "../tooltip";
import Login from "../login";
import UserNav from "../user-nav";
import UserNotifications from "../notifications";
import Gallery from "../gallery";
import Drafts from "../drafts";
import Bookmarks from "../bookmarks";
import Schedules from "../schedules";
import Fragments from "../fragments";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";

import {
  brightnessSvg,
  pencilOutlineSvg,
  menuSvg,
  closeSvg,
  moonSvg,
  globeSvg,
  walletSvg,
  notificationSvg,
  pencilOutlinedSvg,
  userOutlineSvg,
  downArrowSvg,
  upArrowSvg,
  keySvg,
  sunSvg,
  gifCardSvg,
} from "../../img/svg";
import userAvatar from "../user-avatar";
import { downVotingPower, votingPower } from "../../api/hive";
import isCommunity from "../../helper/is-community";
import { setupConfig } from "../../../setup";

interface Props {
  history: History;
  location: Location;
  global: Global;
  dynamicProps: DynamicProps;
  trendingTags: TrendingTags;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  notifications: Notifications;
  step?: number;
  match?: any;
  community?: any;
  fetchTrendingTags: () => void;
  toggleTheme: (theme_key?: string) => void;
  addUser: (user: User) => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  addAccount: (data: Account) => void;
  deleteUser: (username: string) => void;
  fetchNotifications: (since: string | null) => void;
  fetchUnreadNotificationCount: () => void;
  setNotificationsFilter: (filter: NotificationFilter | null) => void;
  markNotifications: (id: string | null) => void;
  toggleUIProp: (what: ToggleType) => void;
  muteNotifications: () => void;
  unMuteNotifications: () => void;
  setLang: (lang: string) => void;
  setStepOne?: () => void;
  setStepTwo?: () => void;
}

interface State {
  smVisible: boolean;
  floating: boolean;
  showMobileSearch: boolean;
  showProfileMenu: boolean;
  gallery: boolean;
  drafts: boolean;
  bookmarks: boolean;
  schedules: boolean;
  fragments: boolean;
  notifications: boolean;
}

export class NavBar extends Component<Props, State> {
  state: State = {
    smVisible: false,
    floating: false,
    showProfileMenu: false,
    showMobileSearch: false,
    gallery: false,
    drafts: false,
    bookmarks: false,
    schedules: false,
    fragments: false,
    notifications: false,
  };

  timer: any = null;
  nav = React.createRef<HTMLDivElement>();

  componentDidMount() {
    // referral check / redirect
    const { location, history } = this.props;
    const qs = queryString.parse(location.search);
    if (!location.pathname.startsWith("/signup") && qs.referral) {
      history.push(`/signup?referral=${qs.referral}`);
    }
  }

  componentWillUnmount() {
    document
      .getElementsByTagName("body")[0]
      .classList.remove("overflow-hidden");
  }

  shouldComponentUpdate(
    nextProps: Readonly<Props>,
    nextState: Readonly<State>
  ): boolean {
    return (
      !isEqual(this.props.global, nextProps.global) ||
      !isEqual(this.props.trendingTags, nextProps.trendingTags) ||
      !isEqual(this.props.users, nextProps.users) ||
      !isEqual(this.props.activeUser, nextProps.activeUser) ||
      !isEqual(this.props.ui, nextProps.ui) ||
      !isEqual(this.props.notifications, nextProps.notifications) ||
      !isEqual(this.props.location, nextProps.location) ||
      !isEqual(this.props.step, nextProps.step) ||
      !isEqual(this.state, nextState)
    );
  }

  componentDidUpdate(prevProps: Props, prevStates: State) {
    if (prevStates.smVisible !== this.state.smVisible) {
      if (this.state.smVisible) {
        document
          .getElementsByTagName("body")[0]
          .classList.add("overflow-hidden");
      }
      if (!this.state.smVisible) {
        document
          .getElementsByTagName("body")[0]
          .classList.remove("overflow-hidden");
      }
    }

    if (
      prevProps.location.pathname !== this.props.location.pathname ||
      prevProps.activeUser !== this.props.activeUser
    ) {
      if (this.props.location.pathname === "/" && !this.props.activeUser) {
        this.props.setStepOne!();
      } else {
        this.props.setStepTwo && this.props.setStepTwo();
      }
    }
  }

  changeTheme = () => {
    this.props.toggleTheme();
  };

  toggleSmVisible = () => {
    const { smVisible } = this.state;
    this.setState({ smVisible: !smVisible });
    if (!smVisible) {
      let rootElement = document.getElementById("root");
      rootElement && rootElement.scrollIntoView();
    }
  };

  handleIconClick = () => {
    if (
      "/" !== this.props?.location?.pathname ||
      this.props?.location?.pathname?.startsWith("/hot") ||
      this.props?.location?.pathname?.startsWith("/created") ||
      this.props?.location?.pathname?.startsWith("/trending")
    ) {
      this.props.history.push("/");
    }
    if (this.props.setStepOne) {
      return this.props.setStepOne();
    }
  };

  // handleSetTheme = () => {
  //     const _default_theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.night : Theme.day
  //     this.props.toggleTheme(_default_theme);
  // }

  handleAutoDetectTheme = (e: MediaQueryListEvent | null = null) => {
    const _default_theme =
      e && e.matches ? Theme.night : (Theme as {[key: string]: string})[this.props.global.ctheme];
    this.props.toggleTheme(_default_theme);
};

  render() {
    const { global, activeUser, ui, step, toggleUIProp, setActiveUser, match } =
      this.props;

      const themeText =
      global.theme === Theme[global.ctheme as keyof typeof Theme]
        ? _t("navbar.night-theme")
        : _t(`navbar.${global.ctheme}-theme`);
            
    const logoHref = activeUser ? `/trending/${global.hive_id}` : "/";
    const {
      smVisible,
      floating,
      showMobileSearch,
      showProfileMenu,
      drafts,
      bookmarks,
      fragments,
      gallery,
      schedules,
    } = this.state;

    const transparentVerify =
      this.props?.location?.pathname?.startsWith("/hot") ||
      this.props?.location?.pathname?.startsWith("/created") ||
      this.props?.location?.pathname?.startsWith("/trending");

    return (
      <div className="sticky-container" id="sticky-container">
        {floating && smVisible && <div className="nav-bar-rep" />}
        <div
          className={`nav-bar-toggle ${"position-fixed"}`}
          onClick={this.toggleSmVisible}
        >
          {smVisible ? closeSvg : menuSvg}
        </div>

        <div
          className={`nav-bar-sm ${"sticky"} ${
            step === 1 ? "transparent" : ""
          }`}
        >
          <div className="brand">
            {activeUser !== null ? (
              <Link to={logoHref}>
                <img
                  style={{ borderRadius: "50%" }}
                  src={`${defaults.imageServer}/u/${global.hive_id}/avatar/lardge`}
                  className="logo"
                  alt="Logo"
                />
              </Link>
            ) : (
              <img
                style={{ borderRadius: "50%" }}
                src={`${defaults.imageServer}/u/${global.hive_id}/avatar/lardge`}
                className="logo"
                alt="Logo"
                onClick={this.handleIconClick}
              />
            )}
          </div>
        </div>

        {!smVisible && (
          <div
            className={`nav-bar ${
              !transparentVerify && step === 1 ? "transparent" : ""
            } `}
          >
            <div
              className={`nav-bar-inner ${
                !transparentVerify && step === 1 ? "transparent" : ""
              }`}
            >
              <div className="brand">
                {activeUser !== null ? (
                  <Link to={logoHref}>
                    <img
                      src={`${defaults.imageServer}/u/${global.hive_id}/avatar/lardge`}
                      style={{ borderRadius: "50%" }}
                      className="logo"
                      alt="Logo"
                    />
                  </Link>
                ) : (
                  <img
                    style={{ borderRadius: "50%" }}
                    src={`${defaults.imageServer}/u/${global.hive_id}/avatar/lardge`}
                    className="logo"
                    alt="Logo"
                    onClick={this.handleIconClick}
                  />
                )}
              </div>
              <div className="flex-spacer" />
              <div className="switch-menu">
                {SwitchLang({ ...this.props })}
                {(step !== 1 || transparentVerify) && (
                  <ToolTip content={themeText}>
                    <div className="switch-theme" onClick={this.changeTheme}>
                      {brightnessSvg}
                    </div>
                  </ToolTip>
                )}
                {(step !== 1 || transparentVerify) && (
                  <ToolTip content={_t("navbar.post")}>
                    <Link
                      className="switch-theme pencil"
                      to={`/submit?com=${global.hive_id}`}
                    >
                      {pencilOutlineSvg}
                    </Link>
                  </ToolTip>
                )}
              </div>
              <div className="btn-menu">
                {!activeUser && (
                  <div>
                    <div className="login-required">
                      <Button
                        className="btn-login btn-primary"
                        onClick={() => {
                          const { toggleUIProp } = this.props;
                          toggleUIProp("login");
                          this.setState({ smVisible: false });
                        }}
                      >
                        {_t("g.login")}
                      </Button>
                      <Link className="btn btn-primary" to="/signup">
                        {_t("g.signup")}
                      </Link>
                    </div>
                    <div className="submit-post">
                      <ToolTip content={_t("navbar.post")}>
                        <Link className="btn btn-outline-primary" to="/submit">
                          {pencilOutlineSvg}
                        </Link>
                      </ToolTip>
                    </div>
                  </div>
                )}
              </div>
              {activeUser && (
                <div>
                  <UserNav {...this.props} activeUser={activeUser} />
                  <div className="submit-post">
                    <ToolTip content={_t("navbar.post")}>
                      <Link className="btn btn-outline-primary" to="/submit">
                        {pencilOutlineSvg}
                      </Link>
                    </ToolTip>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div
          ref={this.nav}
          className={_c(
            `nav-bar ${!transparentVerify && step === 1 ? "transparent" : ""} ${
              smVisible ? "visible-sm" : "d-none"
            }`
          )}
        >
          <div className="nav-bar-inner">
            <div className="mt-2 pt-5 w-100">
              {activeUser && (
                <Link to={`/@${activeUser.username}`}>
                  <div className="p-1 menu-item menu-item-profile d-flex text-white text-15 align-items-center mt-0 mb-3 position-relative">
                    {userAvatar({
                      ...this.props,
                      username: activeUser.username,
                      size: "large",
                    })}
                    <div className="ml-2">
                      <b>@{activeUser.username}</b>
                      <div className="mt-1 text-white">
                        {_t("user-nav.vote-power")} <span>{upArrowSvg}</span>{" "}
                        {(activeUser.data as FullAccount).active &&
                          votingPower(activeUser.data as FullAccount).toFixed(
                            0
                          )}
                        % <span>{downArrowSvg}</span>{" "}
                        {(activeUser.data as FullAccount).active &&
                          downVotingPower(
                            activeUser.data as FullAccount
                          ).toFixed(0)}
                        %
                      </div>
                    </div>
                  </div>
                </Link>
              )}
              {!activeUser && (
                <>
                  <div
                    className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark"
                    onClick={() => {
                      toggleUIProp("login");
                      this.setState({ smVisible: false });
                    }}
                  >
                    <div className="navbar-icon">{userOutlineSvg}</div>
                    <div className="ml-3 text-15">{_t("g.login")}</div>
                  </div>
                  <Link
                    to="/signup"
                    onClick={() =>
                      !showMobileSearch && this.setState({ smVisible: false })
                    }
                  >
                    <div className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark">
                      <div className="navbar-icon">{keySvg}</div>
                      <div className="ml-3 text-15">{_t("g.signup")}</div>
                    </div>
                  </Link>
                </>
              )}

              <Link
                to="/submit"
                onClick={() => this.setState({ smVisible: false })}
              >
                <div className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark">
                  <div className="navbar-icon">{pencilOutlinedSvg}</div>
                  <div className="ml-3 text-15">{_t("g.submit")}</div>
                </div>
              </Link>

              <div>
                {activeUser && (
                  <div
                    className="p-2 pl-3 w-100 mb-2 d-flex align-items-center text-dark"
                    onClick={() =>
                      this.setState({ showProfileMenu: !showProfileMenu })
                    }
                  >
                    <div className="navbar-icon">{userOutlineSvg}</div>
                    <div className="ml-3 text-15">
                      {_t("user-nav.profile-menu")}
                    </div>
                    <div className="ml-3 text-15 icon-stroke">
                      {showProfileMenu ? upArrowSvg : downArrowSvg}
                    </div>
                  </div>
                )}

                {activeUser && showProfileMenu ? (
                  <div className="pl-3 position-relative menu-container">
                    <div className="menu-container-inner">
                      <div
                        className="p-1 menu-item"
                        onClick={() =>
                          this.setState({
                            drafts: !drafts,
                            smVisible: false,
                          })
                        }
                      >
                        <div className="item-text">{_t("user-nav.drafts")}</div>
                      </div>

                      <div
                        className="p-1 menu-item"
                        onClick={() =>
                          this.setState({
                            gallery: !gallery,
                            smVisible: false,
                          })
                        }
                      >
                        <div className="item-text">
                          {_t("user-nav.gallery")}
                        </div>
                      </div>

                      <div
                        className="p-1 menu-item"
                        onClick={() =>
                          this.setState({
                            bookmarks: !bookmarks,
                            smVisible: false,
                          })
                        }
                      >
                        <div className="item-text">
                          {_t("user-nav.bookmarks")}
                        </div>
                      </div>

                      <div
                        className="p-1 menu-item"
                        onClick={() =>
                          this.setState({
                            schedules: !schedules,
                            smVisible: false,
                          })
                        }
                      >
                        <div className="item-text">
                          {_t("user-nav.schedules")}
                        </div>
                      </div>

                      <div
                        className="p-1 menu-item"
                        onClick={() =>
                          this.setState({
                            fragments: !fragments,
                            smVisible: false,
                          })
                        }
                      >
                        <div className="item-text">
                          {_t("user-nav.fragments")}
                        </div>
                      </div>

                      <div className="p-1 menu-item">
                        <Link
                          to={`/@${activeUser.username}/settings`}
                          onClick={() => this.setState({ smVisible: false })}
                        >
                          <div className="item-text">
                            {_t("user-nav.settings")}
                          </div>
                        </Link>
                      </div>

                      <div
                        className="p-1 menu-item"
                        onClick={() => {
                          toggleUIProp("login");
                          this.setState({ smVisible: false });
                        }}
                      >
                        <div className="item-text">{_t("g.login-as")}</div>
                      </div>

                      <div
                        className="p-1 menu-item"
                        onClick={() => setActiveUser(null)}
                      >
                        <div className="item-text">{_t("user-nav.logout")}</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {activeUser && (
                <>
                  <div
                    className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark"
                    onClick={() => toggleUIProp("notifications")}
                  >
                    <div className="navbar-icon text-dark">
                      {notificationSvg}
                    </div>
                    <div className="ml-3 text-15">
                      {_t("user-nav.notifications")}
                    </div>
                  </div>
                  <Link
                    to={`/@${activeUser.username}/points`}
                    onClick={() => this.setState({ smVisible: false })}
                  >
                    <div className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark">
                      <div className="navbar-icon text-dark">{gifCardSvg}</div>
                      <div className="ml-3 text-15">
                        {_t("user-nav.points")}
                      </div>
                    </div>
                  </Link>
                  <Link
                    to={`/@${activeUser?.username}/wallet`}
                    onClick={() => this.setState({ smVisible: false })}
                  >
                    <div className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark">
                      <div className="icon-stroke text-dark">{walletSvg}</div>
                      <div className="ml-3 text-15 d-flex">
                        {_t("user-nav.wallet")}{" "}
                        <div className="dot align-self-start ml-1" />
                      </div>
                    </div>
                  </Link>
                </>
              )}

              <div className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark position-relative">
                <div className="navbar-icon">{globeSvg}</div>
                <div className="text-15 switch-menu">
                  {SwitchLang({
                    ...this.props,
                    label: _t("community-settings.lang"),
                  })}
                </div>
              </div>

              <div
                className="p-2 pl-3 w-100 mb-2 d-flex align-items-center list-item text-dark"
                onClick={this.changeTheme}
              >
                <div className="navbar-icon">
                  {global.theme == Theme.day ? moonSvg : sunSvg}
                </div>
                <div className="ml-3 text-15">
                  {_t("user-nav.switch-to")}{" "}
                  {global.theme == Theme.day
                    ? _t("user-nav.dark")
                    : _t("user-nav.light")}
                </div>
              </div>
            </div>
          </div>
          {ui.login && <Login {...this.props} />}
          {global.usePrivate && <NotificationHandler {...this.props} />}
          {gallery && (
            <Gallery
              {...this.props}
              onHide={() => this.setState({ gallery: !gallery })}
            />
          )}
          {ui.notifications && activeUser && (
            <UserNotifications {...this.props} activeUser={activeUser} />
          )}
          {drafts && activeUser && (
            <Drafts
              {...this.props}
              onHide={() => this.setState({ drafts: !drafts })}
              activeUser={activeUser as ActiveUser}
            />
          )}
          {bookmarks && activeUser && (
            <Bookmarks
              {...this.props}
              onHide={() => this.setState({ bookmarks: !bookmarks })}
              activeUser={activeUser as ActiveUser}
            />
          )}
          {schedules && activeUser && (
            <Schedules
              {...this.props}
              onHide={() => this.setState({ schedules: !schedules })}
              activeUser={activeUser as ActiveUser}
            />
          )}
          {fragments && activeUser && (
            <Fragments
              {...this.props}
              onHide={() => this.setState({ fragments: !fragments })}
              activeUser={activeUser as ActiveUser}
            />
          )}
        </div>
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    location: p.location,
    global: p.global,
    dynamicProps: p.dynamicProps,
    trendingTags: p.trendingTags,
    users: p.users,
    activeUser: p.activeUser,
    ui: p.ui,
    notifications: p.notifications,
    step: p.step,
    fetchTrendingTags: p.fetchTrendingTags,
    toggleTheme: p.toggleTheme,
    addUser: p.addUser,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    addAccount: p.addAccount,
    deleteUser: p.deleteUser,
    fetchNotifications: p.fetchNotifications,
    fetchUnreadNotificationCount: p.fetchUnreadNotificationCount,
    setNotificationsFilter: p.setNotificationsFilter,
    markNotifications: p.markNotifications,
    toggleUIProp: p.toggleUIProp,
    muteNotifications: p.muteNotifications,
    unMuteNotifications: p.unMuteNotifications,
    setLang: p.setLang,
    setStepOne: p.setStepOne,
    setStepTwo: p.setStepTwo,
    match: p.match,
    community: p.community,
  };

  return <NavBar {...props} />;
};
