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

import ToolTip from "../tooltip";
import DownloadTrigger from "../download-trigger";
import Search from "../search";
import Login from "../login";
import UserNav from "../user-nav";
import SignUp from "../sign-up";

import {_t} from "../../i18n";

import {brightnessSvg, appleSvg, googleSvg, desktopSvg, pencilOutlineSvg} from "../../img/svg";

interface Props {
    history: History;
    location: Location;
    global: Global;
    trendingTags: TrendingTags;
    users: User[];
    activeUser: ActiveUser | null;
    ui: UI;
    fetchTrendingTags: () => void;
    toggleTheme: () => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

export default class NavBar extends Component<Props> {
    componentDidMount() {
        const {location, toggleUIProp} = this.props;
        const qs = queryString.parse(location.search);
        if (qs.referral) {
            toggleUIProp('signUp');
        }
    }

    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return (
            !isEqual(this.props.global, nextProps.global) ||
            !isEqual(this.props.trendingTags, nextProps.trendingTags) ||
            !isEqual(this.props.users, nextProps.users) ||
            !isEqual(this.props.activeUser?.username, nextProps.activeUser?.username) ||
            !isEqual(this.props.activeUser, nextProps.activeUser) ||
            !isEqual(this.props.ui, nextProps.ui)
        );
    }

    changeTheme = () => {
        this.props.toggleTheme();
    };

    render() {
        const {global, activeUser, ui} = this.props;
        const themeText = global.theme == Theme.day ? _t("navbar.night-theme") : _t("navbar.day-theme");
        return (
            <div className="nav-bar">
                <div className="nav-bar-inner">
                    <Link to="/" className="brand"/>
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
                    <div className="flex-spacer"/>
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
                            <Button variant="outline-primary" onClick={() => {
                                const {toggleUIProp} = this.props;
                                toggleUIProp('login');
                            }}>{_t("g.login")}</Button>

                            <Button variant="primary" onClick={() => {
                                const {toggleUIProp} = this.props;
                                toggleUIProp('signUp');
                            }}>{_t("g.signup")}</Button>
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
                {ui.signUp && <SignUp {...this.props} />}
            </div>
        );
    }
}
