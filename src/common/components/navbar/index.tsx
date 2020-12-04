import React, {Component} from "react";

import {History, Location} from "history";

import {Button} from "react-bootstrap";

import {Link} from "react-router-dom";

import isEqual from "react-fast-compare";

import queryString from "query-string";

import {Global, Theme} from "../../store/global/types";
import {TrendingTags} from "../../store/trending-tags/types";
import {Account} from "../../store/accounts/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {UI, ToggleType} from "../../store/ui/types";
import {NotificationFilter, Notifications} from "../../store/notifications/types";

import ToolTip from "../tooltip";
import DownloadTrigger from "../download-trigger";
import Search from "../search";
import Login from "../login";
import UserNav from "../user-nav";

import NotificationHandler from "../notification-handler"

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names";

import {brightnessSvg, appleSvg, googleSvg, desktopSvg, pencilOutlineSvg, menuSvg, closeSvg} from "../../img/svg";

const logo = require('../../img/logo-circle.svg');

interface Props {
    history: History;
    location: Location;
    global: Global;
    trendingTags: TrendingTags;
    users: User[];
    activeUser: ActiveUser | null;
    ui: UI;
    notifications: Notifications;
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
}

interface State {
    smVisible: boolean,
    floating: boolean,
}

export class NavBar extends Component<Props, State> {
    state: State = {
        smVisible: false,
        floating: false
    }

    timer: any = null;
    nav = React.createRef<HTMLDivElement>();

    componentDidMount() {
        this.detect();
        window.addEventListener("scroll", this.scrollChanged);
        window.addEventListener("resize", this.scrollChanged);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollChanged);
        window.removeEventListener("resize", this.scrollChanged);
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.props.global, nextProps.global)
            || !isEqual(this.props.trendingTags, nextProps.trendingTags)
            || !isEqual(this.props.users, nextProps.users)
            || !isEqual(this.props.activeUser, nextProps.activeUser)
            || !isEqual(this.props.ui, nextProps.ui)
            || !isEqual(this.props.notifications, nextProps.notifications)
            || !isEqual(this.state, nextState)
    }

    scrollChanged = () => {
        clearTimeout(this.timer);
        this.timer = setTimeout(this.detect, 100);
    }

    detect = () => {
        const nav = this.nav.current;
        if (!nav) return;

        const limit = nav.clientHeight * 2;
        const floating = window.scrollY >= limit;

        if (floating) {
            nav.classList.add("can-float");
        } else {
            nav.classList.remove("can-float");
        }

        this.setState({floating});
    }

    changeTheme = () => {
        this.props.toggleTheme();
    };

    toggleSmVisible = () => {
        const {smVisible} = this.state;
        this.setState({smVisible: !smVisible})
    }

    render() {
        const {global, activeUser, ui} = this.props;
        const themeText = global.theme == Theme.day ? _t("g.night-theme") : _t("g.day-theme");
        const logoHref = activeUser ? `/@${activeUser.username}/feed` : '/';

        const {smVisible, floating} = this.state;

        return (
            <>
                {floating && (<div className="nav-bar-rep"/>)}
                <div className="nav-bar-toggle" onClick={this.toggleSmVisible}>{smVisible ? closeSvg : menuSvg}</div>
                {!smVisible && (
                    <div className="nav-bar-sm">
                        <div className="brand">
                            <Link to={logoHref}>
                                <img src={logo} className="logo" alt="Logo"/>
                            </Link>
                        </div>

                        <div className="text-menu">
                            <Link className="menu-item" to="/discover">
                                {_t("navbar.discover")}
                            </Link>
                            <Link className="menu-item" to="/communities">
                                {_t("navbar.communities")}
                            </Link>
                            <Link className="menu-item" to="/faq">
                                {_t("navbar.faq")}
                            </Link>
                        </div>
                    </div>
                )}
                <div ref={this.nav} className={_c(`nav-bar ${smVisible ? "visible-sm" : ""}`)}>
                    <div className="nav-bar-inner">
                        <div className="brand">
                            <Link to={logoHref}>
                                <img src={logo} className="logo" alt="Logo"/>
                            </Link>
                        </div>
                        <div className="text-menu">
                            <Link className="menu-item" to="/discover">
                                {_t("navbar.discover")}
                            </Link>
                            <Link className="menu-item" to="/communities">
                                {_t("navbar.communities")}
                            </Link>
                            <Link className="menu-item" to="/faq">
                                {_t("navbar.faq")}
                            </Link>
                        </div>
                        <div className="flex-spacer"/>
                        <div className="search-bar">
                            {Search({...this.props})}
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
                                <Button variant="outline-primary" onClick={() => {
                                    const {toggleUIProp} = this.props;
                                    toggleUIProp('login');
                                }}>{_t("g.login")}</Button>

                                <Link className="btn btn-primary" to="/signup">{_t("g.signup")}</Link>
                            </div>
                        )}

                        <div className="submit-post">
                            <ToolTip content={_t("navbar.post")}>
                                <Link className="btn btn-outline-primary" to="/submit">
                                    {pencilOutlineSvg}
                                </Link>
                            </ToolTip>
                        </div>

                        {activeUser && <UserNav {...this.props} activeUser={activeUser}/>}
                    </div>
                    {ui.login && <Login {...this.props} />}
                    <NotificationHandler {...this.props} />
                </div>
            </>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        location: p.location,
        global: p.global,
        trendingTags: p.trendingTags,
        users: p.users,
        activeUser: p.activeUser,
        ui: p.ui,
        notifications: p.notifications,
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
    }

    return <NavBar {...props} />;
}
