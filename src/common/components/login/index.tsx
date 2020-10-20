import React, {Component} from "react";

import {Modal, Form, Button, FormControl} from "react-bootstrap";

import isEqual from "react-fast-compare";

import {PrivateKey, PublicKey, cryptoUtils} from "@hiveio/dhive";

import {History} from "history";

import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType} from "../../store/ui/types";

import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";
import PopoverConfirm from "../popover-confirm";
import OrDivider from "../or-divider";
import {error} from "../feedback";

import {getAuthUrl, makeHsCode} from "../../helper/hive-signer";
import {hsLogin} from "../../../desktop/app/helper/hive-signer";

import {getAccount} from "../../api/hive";
import {hsTokenRenew, usrActivity} from "../../api/private";
import {grantPostingPermission} from "../../api/operations";

import {getRefreshToken} from "../../helper/user-token";

import {_t} from "../../i18n";

import {deleteForeverSvg} from "../../img/svg";

const logo = require('../../img/logo-circle.svg');
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
                {UserAvatar({...this.props, username: user.username, size: "medium"})}
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
    history: History;
    global: Global;
    users: User[];
    activeUser: ActiveUser | null;
    addUser: (user: User) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
}

interface State {
    username: string;
    key: string;
    inProgress: boolean;
}

export class Login extends Component<LoginProps, State> {
    state: State = {
        username: '',
        key: '',
        inProgress: false
    }

    _mounted: boolean = true;

    shouldComponentUpdate(nextProps: Readonly<LoginProps>, nextState: Readonly<State>): boolean {
        return !isEqual(this.props.users, nextProps.users)
            || !isEqual(this.props.activeUser, nextProps.activeUser)
            || !isEqual(this.state, nextState);
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    hide = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp('login');
    }

    userSelect = (user: User) => {
        const {setActiveUser, updateActiveUser, addUser} = this.props;

        // activate the user
        setActiveUser(user.username);

        // get access token from code
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

            // login activity
            return usrActivity(user.username, 20);
        });

        this.hide();
    }

    userDelete = (user: User) => {
        const {activeUser, deleteUser, setActiveUser} = this.props;
        deleteUser(user.username);

        // logout if active user
        if (activeUser && user.username === activeUser.username) {
            setActiveUser(null);
        }
    }

    usernameChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const {value: username} = e.target;
        this.stateSet({username: username.trim()});
    }

    keyChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const {value: key} = e.target;
        this.stateSet({key: key.trim()});
    }

    inputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            this.login().then();
        }
    }

    hsLogin = () => {
        const {global, history} = this.props;
        if (global.isElectron) {
            hsLogin().then(r => {
                this.hide();
                history.push(`/auth?code=${r.code}`);
            }).catch((e) => {
                error(e);
            });
            return;
        }

        window.location.href = getAuthUrl();
    }

    login = async () => {
        const {username, key} = this.state;

        if (username === '' || key === '') {
            error(_t('login.error-fields-required'));
            return;
        }

        // Warn if the code is a public key
        try {
            PublicKey.fromString(key);
            error(_t('login.error-public-key'));
            return;
        } catch (e) {
        }

        const isMasterKey = !cryptoUtils.isWif(key);

        let account: Account;

        this.stateSet({inProgress: true});

        try {
            account = await getAccount(username);
        } catch (err) {
            error(_t('login.error-user-fetch'));
            return;
        } finally {
            this.stateSet({inProgress: false});
        }

        if (!(account && account.name === username)) {
            error(_t('login.error-user-not-found'));
            return;
        }

        // Active public key of the account
        const activePublic = account?.active!.key_auths.map(x => x[0]);

        // Get active private key from user entered code
        let activePrivateKey: PrivateKey;
        if (isMasterKey) {
            activePrivateKey = PrivateKey.fromLogin(account.name, key, 'active');
        } else {
            activePrivateKey = PrivateKey.fromString(key);
        }

        // Generate public key from the private key
        const activePublicInput = activePrivateKey.createPublic().toString();

        // Compare keys
        if (!activePublic.includes(activePublicInput)) {
            error(_t('login.error-authenticate')); // enter master or active key
            return;
        }

        const hasPostingPerm = account?.posting!.account_auths.filter(x => x[0] === "ecency.app").length > 0;

        if (!hasPostingPerm) {
            this.stateSet({inProgress: true});
            try {
                await grantPostingPermission(activePrivateKey, account, "ecency.app")
            } catch (err) {
                error(_t('login.error-permission'));
                return;
            } finally {
                this.stateSet({inProgress: false});
            }
        }

        const code = makeHsCode(account.name, activePrivateKey);

        this.stateSet({inProgress: true});

        // get access token from code
        hsTokenRenew(code).then(x => {
            const {setActiveUser, updateActiveUser, addUser} = this.props;
            const user: User = {
                username: x.username,
                accessToken: x.access_token,
                refreshToken: x.refresh_token,
                expiresIn: x.expires_in,
            };

            // add / update user data
            addUser(user);

            // activate user
            setActiveUser(user.username);

            // add account data of the user to the reducer
            updateActiveUser(account);

            // login activity
            usrActivity(user.username, 20);

            // done
            this.hide();
        }).catch(() => {
            error(_t('g.server-error'));
        }).finally(() => {
            this.stateSet({inProgress: false});
        });
    }

    render() {
        const {username, key, inProgress} = this.state;
        const {users, activeUser} = this.props;
        return (
            <>
                {users.length === 0 && (
                    <div className="dialog-header">
                        <img src={logo} alt="Logo"/>
                        <h2>{_t('login.title')}</h2>
                    </div>
                )}

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
                                            onSelect={this.userSelect}
                                            onDelete={this.userDelete}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <OrDivider/>
                    </>
                )}

                <Form className="login-form" onSubmit={(e: React.FormEvent) => {
                    e.preventDefault();
                }}>
                    <p className="login-form-text">{_t('login.with-user-pass')}</p>
                    <Form.Group>
                        <Form.Control type="text" value={username} onChange={this.usernameChanged} placeholder={_t('login.username-placeholder')} autoFocus={true}
                                      onKeyDown={this.inputKeyDown}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Control type="password" value={key} autoComplete="off" onChange={this.keyChanged} placeholder={_t('login.key-placeholder')}
                                      onKeyDown={this.inputKeyDown}/>
                    </Form.Group>
                    <p className="login-form-text">{_t('login.login-info-1')} <a onClick={((e) => {
                        e.preventDefault();
                        this.hide();
                        window.location.href = '/faq#how-to-signin';
                    })} href="#">{_t('login.login-info-2')}</a></p>
                    <Button disabled={inProgress} block={true} onClick={this.login}>{_t('g.login')}</Button>
                </Form>
                <OrDivider/>
                <div className="hs-login">
                    <a className="btn btn-outline-primary" onClick={this.hsLogin}>
                        <img src={hsLogo} className="hs-logo" alt="hivesigner"/> {_t("login.with-hive-signer")}
                    </a>
                </div>
                {activeUser === null && (
                    <p>
                        {_t("login.sign-up-text-1")}
                        &nbsp;
                        <a href="#" onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            this.hide();

                            const {toggleUIProp} = this.props;
                            toggleUIProp("signUp");

                        }}>{_t("login.sign-up-text-2")}</a>
                    </p>
                )}
            </>
        );
    }
}

interface Props {
    history: History;
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
            <Modal show={true} centered={true} onHide={this.hide} className="login-modal modal-thin-header" animation={false}>
                <Modal.Header closeButton={true}/>
                <Modal.Body>
                    <Login {...this.props}/>
                </Modal.Body>
            </Modal>
        );
    }
}
