import React, { Component } from "react";

import { Link } from "react-router-dom";

import { History, Location } from "history";

import { Button } from "react-bootstrap";

import isEqual from "react-fast-compare";

import queryString from "query-string";

import { Global, Theme } from "../../../../common/store/global/types";
import { TrendingTags } from "../../../../common/store/trending-tags/types";
import { Account } from "../../../../common/store/accounts/types";
import { User } from "../../../../common/store/users/types";
import { ActiveUser } from "../../../../common/store/active-user/types";
import { UI, ToggleType } from "../../../../common/store/ui/types";
import { NotificationFilter, Notifications } from "../../../../common/store/notifications/types";
import { DynamicProps } from "../../../../common/store/dynamic-props/types";

import ToolTip from "../../../../common/components/tooltip";
import Login from "../../../../common/components/login";
import UserNav from "../../../../common/components/user-nav/user-nav";
import DropDown from "../../../../common/components/dropdown";
import SearchSuggester from "../../../../common/components/search-suggester";
import Updater from "../updater";
import SwitchLang from "../../../../common/components/switch-lang";

import NotificationHandler from "../../../../common/components/notification-handler";

import { _t } from "../../../../common/i18n";

import _c from "../../../../common/util/fix-class-names";

import defaults from "../../../../common/constants/defaults.json";

import routes from "../../../../common/routes";

import { version } from "../../../package.json";

import {
  brightnessSvg,
  pencilOutlineSvg,
  arrowLeftSvg,
  arrowRightSvg,
  refreshSvg,
  magnifySvg,
  dotsHorizontal,
  translateSvg
} from "../../../../common/img/svg";
import isElectron from "../../../../common/util/is-electron";
import "./_index.scss";

// why "require" instead "import" ? see: https://github.com/ReactTraining/react-router/issues/6203

const pathToRegexp = require("path-to-regexp");
import isCommunity from "../../../../common/helper/is-community";
import { NotifyTypes } from "../../../../common/enums";
import {
  setNotificationsSettingsItem,
  updateNotificationsSettings
} from "../../../../common/store/notifications";
const logo = "./img/logo-circle.svg";

interface AddressBarProps {
  history: History;
  location: Location;
  global: Global;
  trendingTags: TrendingTags;
}

interface AddressBarState {
  address: string;
  realAddress: string;
  changed: boolean;
}

export class AddressBar extends Component<AddressBarProps, AddressBarState> {
  state: AddressBarState = {
    address: "",
    realAddress: "",
    changed: false
  };

  componentDidMount() {
    this.fixAddress();
  }

  shouldComponentUpdate(
    nextProps: Readonly<AddressBarProps>,
    nextState: Readonly<AddressBarState>
  ) {
    const { location } = this.props;

    return !isEqual(location, nextProps.location) || !isEqual(this.state, nextState);
  }

  componentDidUpdate(prevProps: Readonly<AddressBarProps>) {
    const { location } = this.props;

    if (location !== prevProps.location) {
      this.fixAddress();
    }
  }

  fixAddress = () => {
    const { history, location } = this.props;

    // @ts-ignore this is for making ide happy. code compiles without error.
    const entries = history.entries || {};
    // @ts-ignore
    const index = history.index || 0;

    const curPath = entries[index]?.pathname || "/";
    let address = curPath === "/" ? `${defaults.filter}` : curPath.replace("/", "");

    // persist search string
    if (curPath.startsWith("/search")) {
      const qs = queryString.parse(location.search);
      if (qs.q as string) {
        address = qs.q;
      }
    }

    if (location.search && location.search.length > 0) {
      address = location.pathname + location.search;
      if (address[0] === "/") {
        address = address.replace("/", "");
      }
    }

    const spt = address.split("/");
    if (spt[0] == spt[1]) {
      address = spt;
      address.shift();
      address = address.join("/");
    }

    this.setState({ address, realAddress: address });
  };

  addressChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      address: e.target.value,
      changed: true
    });
  };

  addressKeyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      const { address, changed } = this.state;
      const { history } = this.props;

      if (!changed) return;

      if (address.trim() === "") {
        return;
      }

      // website address is just a placeholder here
      const url = new URL(address, "https://ecency.com");

      // check if entered value matches with a route
      const pathMatch = Object.values(routes).find((p) => {
        return pathToRegexp(p).test(url.pathname);
      });

      if (pathMatch) {
        let isAddressValidForElectron = isElectron() && address.includes("?");
        if (isAddressValidForElectron) {
          let validAddress = address[0] == "/" ? address.replace("/", "") : address;
          this.setState({ address: validAddress });

          history.push(`/${validAddress}`);
          return;
        }
        let validAddress = url.pathname[0] == "/" ? url.pathname.replace("/", "") : url.pathname;
        this.setState({ address: validAddress });

        history.push(`/${validAddress}`);
        return;
      }

      history.push(`/search/?q=${encodeURIComponent(address)}`);
    }

    if (e.keyCode === 27) {
      const { realAddress } = this.state;

      this.setState({ address: realAddress });
    }
  };

  render() {
    const { address, changed } = this.state;
    return (
      <div className="address">
        <div className="pre-add-on">{magnifySvg}</div>
        <span className="protocol">ecency://</span>
        <div className="url">
          {/* <SearchSuggester {...this.props} value={address} changed={changed}> */}
          <input
            type="text"
            value={address}
            onChange={this.addressChanged}
            onKeyUp={this.addressKeyup}
            placeholder={_t("navbar.address-placeholder")}
            spellCheck={false}
          />
          {/* </SearchSuggester> */}
        </div>
      </div>
    );
  }
}

interface NavControlsProps {
  history: History;
  location: Location;
  reloadFn?: () => any;
  reloading?: boolean;
}

export class NavControls extends Component<NavControlsProps> {
  shouldComponentUpdate(nextProps: Readonly<NavControlsProps>) {
    const { history, location, reloading } = this.props;

    return (
      reloading !== nextProps.reloading ||
      !isEqual(history, nextProps.history) ||
      !isEqual(location, nextProps.location)
    );
  }

  goBack = () => {
    const { history } = this.props;

    history.goBack();

    // scroll to anchor element
    let href = (history as any).entries.lastItem.pathname.split("/");
    if (href.length === 4) {
      href = href[href.length - 2] + href[href.length - 1];
      setTimeout(() => {
        if (href.length > 0) {
          href = href.replace(/[0-9]/g, "").replace(/@/g, "");
          let element = document.getElementById(href);
          if (element) {
            let elementSibling = element!.previousElementSibling;
            if (elementSibling) {
              elementSibling!.scrollIntoView!();
            } else {
              element!.scrollIntoView!();
            }
          }
        }
      }, 75);
    }
  };

  goForward = () => {
    const { history } = this.props;

    history.goForward();
  };

  refresh = () => {
    const { reloadFn } = this.props;
    if (reloadFn) {
      reloadFn();
    }
  };

  render() {
    const { history, reloadFn, reloading } = this.props;

    // @ts-ignore make ide happy. code compiles without error.
    const entries = history.entries || {};
    // @ts-ignore
    const index = history.index || 0;

    const canGoBack = !!entries[index - 1];
    const canGoForward = !!entries[index + 1];

    const backClassName = _c(`back ${!canGoBack ? "disabled" : ""}`);
    const forwardClassName = _c(`forward ${!canGoForward ? "disabled" : ""}`);
    const reloadClassName = _c(`reload ${!reloadFn || reloading ? "disabled" : ""}`);

    return (
      <div className="nav-controls">
        <div className={backClassName} onClick={() => this.goBack()}>
          {arrowLeftSvg}
        </div>
        <div className={forwardClassName} onClick={() => this.goForward()}>
          {arrowRightSvg}
        </div>
        <div className={reloadClassName} onClick={() => this.refresh()}>
          {refreshSvg}
        </div>
      </div>
    );
  }
}

interface Props {
  history: History;
  location: Location;
  global: Global;
  dynamicProps: DynamicProps;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  notifications: Notifications;
  trendingTags: TrendingTags;
  fetchTrendingTags: () => void;
  toggleTheme: () => void;
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
  dismissNewVersion: () => void;
  reloadFn?: () => any;
  setStepTwo?: () => any;
  reloading?: boolean;
  step?: number;
  match?: any;
  fetchNotificationsSettings: (username: string) => void;
  updateNotificationsSettings: typeof updateNotificationsSettings;
  setNotificationsSettingsItem: typeof setNotificationsSettingsItem;
}

interface State {
  floating: boolean;
}

export class NavBar extends Component<Props, State> {
  state: State = {
    floating: false
  };

  timer: any = null;
  nav = React.createRef<HTMLDivElement>();

  componentDidMount() {
    this.detect();
    window.addEventListener("scroll", this.scrollChanged);
    window.addEventListener("resize", this.scrollChanged);

    // fetch trending tags for global usage
    const { fetchTrendingTags } = this.props;
    fetchTrendingTags();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollChanged);
    window.removeEventListener("resize", this.scrollChanged);
  }

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
    return (
      !isEqual(this.props.global, nextProps.global) ||
      !isEqual(this.props.history, nextProps.history) ||
      !isEqual(this.props.location, nextProps.location) ||
      !isEqual(this.props.users, nextProps.users) ||
      !isEqual(this.props.activeUser, nextProps.activeUser) ||
      !isEqual(this.props.ui, nextProps.ui) ||
      !isEqual(this.props.notifications, nextProps.notifications) ||
      !isEqual(this.props.reloading, nextProps.reloading) ||
      !isEqual(this.state, nextState)
    );
  }

  componentDidUpdate(prevProps: Props) {
    const { location, activeUser, setStepTwo } = this.props;
    if (location.pathname == "/" && activeUser && activeUser.username && setStepTwo) {
      setStepTwo();
    }
  }

  scrollChanged = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.detect, 100);
  };

  detect = () => {
    const nav = this.nav.current;
    if (!nav) return;
  };

  changeTheme = () => {
    this.props.toggleTheme();
  };

  render() {
    const { global, activeUser, history, location, ui, step, match } = this.props;
    const themeText = global.theme == Theme.day ? _t("navbar.night-theme") : _t("navbar.day-theme");
    const communityPage = match && match.params.name && isCommunity(match.params.name);
    const tagValue = global.tag ? `/${global.tag}` : "";
    const logoHref =
      (activeUser
        ? communityPage ||
          (global.tag?.includes("@") &&
            [
              "engine",
              "wallet",
              "points",
              "communities",
              "settings",
              "permissions",
              "comments",
              "replies",
              "blog",
              "posts",
              "feed",
              "referrals",
              "followers",
              "following"
            ].includes(global.filter))
          ? "/hot"
          : global.filter === "feed"
          ? `${tagValue}/${global.filter}`
          : `/${global.filter}${tagValue}`
        : "/") ?? "/";

    const { floating } = this.state;

    const textMenuConfig = {
      history: this.props.history,
      label: "",
      icon: dotsHorizontal,
      items: [
        {
          label: _t("navbar.discover"),
          href: `/discover`,
          selected: location.pathname === "/discover"
        },
        {
          label: _t("navbar.communities"),
          href: `/communities`,
          selected: location.pathname === "/communities"
        },
        {
          label: _t("navbar.decks"),
          href: `/decks`,
          selected: location.pathname === "/decks"
        }
      ],
      postElem: <div className="drop-down-menu-version">Ecency Surfer {version}</div>
    };
    let noMargin = step && step === 1;

    return (
      <>
        {floating && <div className="nav-bar-electron-rep" />}
        <div ref={this.nav} className={_c(`nav-bar-electron ${noMargin ? "mb-0" : ""}`)}>
          <div className="nav-bar-inner">
            <div className="brand">
              <Link to={logoHref}>
                <img src={logo} className="logo" alt="Logo" />
              </Link>
            </div>

            <div className="nav-controls">
              <NavControls
                history={history}
                location={location}
                reloading={this.props.reloading}
                reloadFn={this.props.reloadFn}
              />
            </div>

            <div className="address-bar">
              <AddressBar
                history={history}
                location={location}
                global={global}
                trendingTags={this.props.trendingTags}
              />
            </div>

            <div className="text-menu">
              <DropDown {...textMenuConfig} float="right" />
            </div>

            <SwitchLang {...this.props} />

            <ToolTip content={themeText}>
              <div className="switch-theme" onClick={this.changeTheme}>
                {brightnessSvg}
              </div>
            </ToolTip>

            {!activeUser && (
              <div className="login-required">
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    const { toggleUIProp } = this.props;
                    toggleUIProp("login");
                  }}
                >
                  {_t("g.login")}
                </Button>

                <Link className="btn btn-primary" to="/signup">
                  {_t("g.signup")}
                </Link>
              </div>
            )}

            <div className="submit-post">
              <ToolTip content={_t("navbar.post")}>
                <Link className="btn btn-outline-primary" to="/submit">
                  {pencilOutlineSvg}
                </Link>
              </ToolTip>
            </div>

            {activeUser && <UserNav {...this.props} />}
          </div>

          {ui.login && <Login {...this.props} />}
          {global.usePrivate && <NotificationHandler />}
        </div>
        {global.newVersion && (
          <Updater global={global} dismissNewVersion={this.props.dismissNewVersion} />
        )}
      </>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    location: p.location,
    global: p.global,
    dynamicProps: p.dynamicProps,
    users: p.users,
    activeUser: p.activeUser,
    ui: p.ui,
    notifications: p.notifications,
    trendingTags: p.trendingTags,
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
    dismissNewVersion: p.dismissNewVersion,
    reloadFn: p.reloadFn,
    reloading: p.reloading,
    step: p.step,
    setStepTwo: p.setStepTwo,
    match: p.match,
    fetchNotificationsSettings: p.fetchNotificationsSettings,
    updateNotificationsSettings: p.updateNotificationsSettings,
    setNotificationsSettingsItem: p.setNotificationsSettingsItem
  };

  return <NavBar {...props} />;
};
