import React, {Component} from "react";

import {Modal} from "react-bootstrap";

import isEqual from "react-fast-compare";

import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType} from "../../store/ui/types";

import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";
import PopoverConfirm from "../popover-confirm";
import OrDivider from "../or-divider";

import {getAuthUrl} from "../../helper/hive-signer";

import {getAccount} from "../../api/hive";
import {hsTokenRenew, usrActivity} from "../../api/private";

import {getRefreshToken} from "../../helper/user-token";

import {_t} from "../../i18n";

import {deleteForeverSvg} from "../../img/svg";

const hsLogo = require("../../img/hive-signer.svg");

interface UserItemProps {
    global: Global;
    user: User;
    activeUser: ActiveUser | null;
    onSelect: (user: User) => void;
    onDelete: (user: User) => void;
}

export class UserItem extends Component<UserItemProps> {
    render() {
        const {user, activeUser} = this.props;

        return (
            <div
                className={`user-list-item ${activeUser && activeUser.username === user.username ? "active" : ""}`}
                onClick={() => {
                    const {onSelect} = this.props;
                    onSelect(user);
                }}
            >
                {UserAvatar({...this.props, username: user.username, size: "normal"})}
                <span className="username">@{user.username}</span>
                {activeUser && activeUser.username === user.username && <div className="check-mark"/>}
                <div className="flex-spacer"/>
                <PopoverConfirm
                    onConfirm={() => {
                        const {onDelete} = this.props;
                        onDelete(user);
                    }}
                >
                    <div
                        className="btn-delete"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <Tooltip content={_t("g.delete")}>
                            <span>{deleteForeverSvg}</span>
                        </Tooltip>
                    </div>
                </PopoverConfirm>
            </div>
        );
    }
}

interface LoginProps {
    global: Global;
    users: User[];
    activeUser: ActiveUser | null;
    addUser: (user: User) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

export class Login extends Component<LoginProps> {
    shouldComponentUpdate(nextProps: Readonly<LoginProps>): boolean {
        return !isEqual(this.props.users, nextProps.users) || !isEqual(this.props.activeUser, nextProps.activeUser);
    }

    hide = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp('login');
    }

    render() {
        const {users, activeUser} = this.props;
        return (
            <>
                {users.length > 0 && (
                    <>
                        <div className="user-list">
                            <div className="user-list-header">{_t("g.login-as")}</div>
                            <div className="user-list-body">
                                {users.map((u) => {
                                    return (
                                        <UserItem
                                            key={u.username}
                                            {...this.props}
                                            user={u}
                                            onSelect={(user) => {
                                                const {setActiveUser, updateActiveUser, addUser} = this.props;
                                                setActiveUser(user.username);

                                                hsTokenRenew(getRefreshToken(user.username)).then(x => {
                                                    const user: User = {
                                                        username: x.username,
                                                        accessToken: x.access_token,
                                                        refreshToken: x.refresh_token,
                                                        expiresIn: x.expires_in,
                                                    };

                                                    // update the user with new token
                                                    addUser(user);

                                                    return getAccount(user.username);
                                                }).then((r) => {
                                                    // update active user

                                                    updateActiveUser(r);
                                                    return usrActivity(user.username, 20);
                                                });

                                                this.hide();
                                            }}
                                            onDelete={(user) => {
                                                const {activeUser, deleteUser, setActiveUser} = this.props;
                                                deleteUser(user.username);

                                                if (activeUser && user.username === activeUser.username) {
                                                    setActiveUser(null);
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <OrDivider/>
                    </>
                )}
                <div className="hs-login">
                    <a className="btn btn-outline-primary" href={getAuthUrl()}>
                        <img src={hsLogo} className="hs-logo" alt="hivesigner"/> {_t("login.with-hivesigner")}
                    </a>
                </div>
                {activeUser === null && (
                    <p>
                        {_t("login.signup-text-1")}
                        &nbsp;
                        <a href="#" onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            this.hide();

                            const {toggleUIProp} = this.props;
                            toggleUIProp("signUp");

                        }}>{_t("login.signup-text-2")}</a>
                    </p>
                )}
            </>
        );
    }
}

interface Props {
    global: Global;
    users: User[];
    activeUser: ActiveUser | null;
    addUser: (user: User) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

export default class LoginDialog extends Component<Props> {

    hide = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp('login');
    }

    render() {
        return (
            <Modal show={true} centered={true} onHide={this.hide} className="login-modal modal-thin-header">
                <Modal.Header closeButton={true}/>
                <Modal.Body>
                    <Login {...this.props}/>
                </Modal.Body>
            </Modal>
        );
    }
}
