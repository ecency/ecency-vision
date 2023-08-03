import React, { Component } from "react";

import { Button, Form, FormControl } from "react-bootstrap";

import isEqual from "react-fast-compare";

import { cryptoUtils, PrivateKey, PublicKey } from "@hiveio/dhive";

import { History, Location } from "history";
import * as ls from "../../util/local-storage";
import { decodeObj } from "../../util/encoder";

import { AppWindow } from "../../../client/window";

import { Global } from "../../store/global/types";
import { ToggleType, UI } from "../../store/ui/types";
import { User, UserKeys } from "../../store/users/types";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import UserAvatar from "../user-avatar";
import Tooltip from "../tooltip";
import PopoverConfirm from "@ui/popover-confirm";
import OrDivider from "../or-divider";
import { error } from "../feedback";

import { getAuthUrl, makeHsCode } from "../../helper/hive-signer";
import { hsLogin } from "../../../desktop/app/helper/hive-signer";
import { generateKeys } from "../../helper/generate-private-keys";

import { getAccount } from "../../api/hive";
import { usrActivity } from "../../api/private-api";
import { hsTokenRenew } from "../../api/auth-api";
import { formatError, grantPostingPermission } from "../../api/operations";

import { getRefreshToken } from "../../helper/user-token";

import ReCAPTCHA from "react-google-recaptcha";

import { addAccountAuthority, signBuffer } from "../../helper/keychain";

import { _t } from "../../i18n";
import _c from "../../util/fix-class-names";

import { deleteForeverSvg } from "../../img/svg";
import { useMappedStore } from "../../store/use-mapped-store";
import { useLocation } from "react-router";
import "./_index.scss";
import { Spinner } from "../spinner";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";

declare var window: AppWindow;

interface LoginKcProps {
  toggleUIProp: (what: ToggleType) => void;
  doLogin: (
    hsCode: string,
    postingKey: null | undefined | string,
    account: Account
  ) => Promise<void>;
  global: Global;
}

interface LoginKcState {
  username: string;
  inProgress: boolean;
}

export class LoginKc extends BaseComponent<LoginKcProps, LoginKcState> {
  state: LoginKcState = {
    username: "",
    inProgress: false
  };

  usernameChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { value: username } = e.target;
    this.stateSet({ username: username.trim().toLowerCase() });
  };

  inputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      this.login().then();
    }
  };

  hide = () => {
    const { toggleUIProp } = this.props;
    toggleUIProp("login");
  };

  login = async () => {
    const { hsClientId } = this.props.global;
    const { username } = this.state;
    if (!username) {
      return;
    }

    let account: Account;

    this.stateSet({ inProgress: true });

    try {
      account = await getAccount(username);
    } catch (err) {
      error(_t("login.error-user-fetch"));
      return;
    } finally {
      this.stateSet({ inProgress: false });
    }

    if (!(account && account.name === username)) {
      error(_t("login.error-user-not-found"));
      return;
    }

    const hasPostingPerm =
      account?.posting!.account_auths.filter((x) => x[0] === hsClientId).length > 0;

    if (!hasPostingPerm) {
      const weight = account.posting!.weight_threshold;

      this.stateSet({ inProgress: true });
      try {
        await addAccountAuthority(username, hsClientId, "Posting", weight);
      } catch (err) {
        error(_t("login.error-permission"));
        return;
      } finally {
        this.stateSet({ inProgress: false });
      }
    }

    this.stateSet({ inProgress: true });

    const signer = (message: string): Promise<string> =>
      signBuffer(username, message, "Active").then((r) => r.result);

    let code: string;
    try {
      code = await makeHsCode(hsClientId, username, signer);
    } catch (err) {
      error(...formatError(err));
      this.stateSet({ inProgress: false });
      return;
    }

    const { doLogin } = this.props;

    doLogin(code, null, account)
      .then(() => {
        this.hide();
      })
      .catch(() => {
        error(_t("g.server-error"));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  back = () => {
    const { toggleUIProp } = this.props;
    toggleUIProp("loginKc");
  };

  render() {
    const { username, inProgress } = this.state;
    const { global } = this.props;

    const keyChainLogo = global.isElectron
      ? "./img/keychain.png"
      : require("../../img/keychain.png");

    const spinner = <Spinner className="mr-[6px] w-3.5 h-3.5" />;

    return (
      <>
        <div className="dialog-header">
          <img src={keyChainLogo} alt="Logo" />
          <h2>{_t("login.with-keychain")}</h2>
        </div>

        <Form
          className="login-form"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
          }}
        >
          <Form.Group>
            <Form.Control
              type="text"
              value={username}
              onChange={this.usernameChanged}
              placeholder={_t("login.username-placeholder")}
              autoFocus={true}
              onKeyDown={this.inputKeyDown}
            />
          </Form.Group>
          <Button disabled={inProgress} block={true} onClick={this.login}>
            {inProgress && spinner}
            {_t("g.login")}
          </Button>
          <Button variant="outline-primary" disabled={inProgress} block={true} onClick={this.back}>
            {_t("g.back")}
          </Button>
        </Form>
      </>
    );
  }
}

interface UserItemProps {
  global: Global;
  user: User;
  activeUser: ActiveUser | null;
  disabled: boolean;
  onSelect: (user: User) => void;
  onDelete: (user: User) => void;
  containerRef?: React.RefObject<HTMLInputElement>;
}

export class UserItem extends Component<UserItemProps> {
  render() {
    const { user, activeUser, disabled, containerRef } = this.props;

    return (
      <div
        className={_c(
          `user-list-item ${disabled ? "disabled" : ""} ${
            activeUser && activeUser.username === user.username ? "active" : ""
          }`
        )}
        onClick={() => {
          const { onSelect } = this.props;
          onSelect(user);
        }}
      >
        <UserAvatar username={user.username} size="medium" />
        <span className="username">@{user.username}</span>
        {activeUser && activeUser.username === user.username && <div className="check-mark" />}
        <div className="flex-spacer" />
        <PopoverConfirm
          onConfirm={() => {
            const { onDelete } = this.props;
            onDelete(user);
          }}
          placement="left"
          trigger="click"
          containerRef={containerRef}
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
  setActiveUser: (username: string | null) => void;
  addUser: (user: User) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  doLogin: (
    hsCode: string,
    postingKey: null | undefined | string,
    account: Account
  ) => Promise<void>;
  userListRef?: any;
}

interface State {
  username: string;
  key: string;
  inProgress: boolean;
  isVerified: boolean;
}

export class Login extends BaseComponent<LoginProps, State> {
  state: State = {
    username: "",
    key: "",
    inProgress: false,
    isVerified: this.props.global.isElectron ? true : false
  };

  shouldComponentUpdate(nextProps: Readonly<LoginProps>, nextState: Readonly<State>): boolean {
    return (
      !isEqual(this.props.users, nextProps.users) ||
      !isEqual(this.props.activeUser, nextProps.activeUser) ||
      !isEqual(this.state, nextState)
    );
  }

  hide = () => {
    const { toggleUIProp } = this.props;
    toggleUIProp("login");
  };

  userSelect = (user: User) => {
    const { doLogin } = this.props;

    this.stateSet({ inProgress: true });

    getAccount(user.username)
      .then((account) => {
        let token = getRefreshToken(user.username);
        if (!token) {
          error(`${_t("login.error-user-not-found-cache")}`);
        }
        return token ? doLogin(token, user.postingKey, account) : this.userDelete(user);
      })
      .then(() => {
        this.hide();
        let shouldShowTutorialJourney = ls.get(`${user.username}HadTutorial`);

        if (
          !shouldShowTutorialJourney &&
          shouldShowTutorialJourney &&
          shouldShowTutorialJourney !== "true"
        ) {
          ls.set(`${user.username}HadTutorial`, "false");
        }
      })
      .catch(() => {
        error(_t("g.server-error"));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  userDelete = (user: User) => {
    const { activeUser, deleteUser, setActiveUser } = this.props;
    deleteUser(user.username);

    // logout if active user
    if (activeUser && user.username === activeUser.username) {
      setActiveUser(null);
    }
  };

  usernameChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { value: username } = e.target;
    this.stateSet({ username: username.trim().toLowerCase() });
  };

  keyChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { value: key } = e.target;
    this.stateSet({ key: key.trim() });
  };

  inputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      this.login().then();
    }
  };

  hsLogin = () => {
    const { global, history } = this.props;
    const { hsClientId } = global;
    if (global.isElectron) {
      hsLogin(hsClientId)
        .then((r) => {
          this.hide();
          history.push(`/auth?code=${r.code}`);
        })
        .catch((e) => {
          error(e);
        });
      return;
    }

    window.location.href = getAuthUrl(hsClientId);
  };

  kcLogin = () => {
    const { toggleUIProp } = this.props;
    toggleUIProp("loginKc");
  };

  captchaCheck = (value: string | null) => {
    if (value) {
      this.setState({ isVerified: true });
    }
  };

  login = async () => {
    const { hsClientId } = this.props.global;
    const { username, key } = this.state;
    const { addUser } = this.props;

    if (username === "" || key === "") {
      error(_t("login.error-fields-required"));
      return;
    }
    if (!this.state.isVerified) {
      error(_t("login.captcha-check-required"));
      return;
    }
    // Warn if the code is a public key
    try {
      PublicKey.fromString(key);
      error(_t("login.error-public-key"));
      return;
    } catch (e) {}

    let account: Account;

    this.stateSet({ inProgress: true });

    try {
      account = await getAccount(username);
    } catch (err) {
      error(_t("login.error-user-fetch"));
      return;
    } finally {
      this.stateSet({ inProgress: false });
    }

    if (!(account && account.name === username)) {
      error(_t("login.error-user-not-found"));
      return;
    }

    // Posting public key of the account
    const postingPublic = account?.posting!.key_auths.map((x) => x[0]);

    const isPlainPassword = !cryptoUtils.isWif(key);

    let thePrivateKey: PrivateKey;

    // Whether using posting private key to login
    let withPostingKey = false;

    if (
      !isPlainPassword &&
      postingPublic.includes(PrivateKey.fromString(key).createPublic().toString())
    ) {
      // Login with posting private key
      withPostingKey = true;
      thePrivateKey = PrivateKey.fromString(key);
    } else {
      // Login with master or active private key
      // Get active private key from user entered code
      if (isPlainPassword) {
        thePrivateKey = PrivateKey.fromLogin(account.name, key, "active");
      } else {
        thePrivateKey = PrivateKey.fromString(key);
      }

      // Generate public key from the private key
      const activePublicInput = thePrivateKey.createPublic().toString();

      // Active public key of the account
      const activePublic = account?.active!.key_auths.map((x) => x[0]);

      // Compare keys
      if (!activePublic.includes(activePublicInput)) {
        error(_t("login.error-authenticate")); // enter master or active key
        return;
      }

      const hasPostingPerm =
        account?.posting!.account_auths.filter((x) => x[0] === hsClientId).length > 0;

      if (!hasPostingPerm) {
        this.stateSet({ inProgress: true });
        try {
          await grantPostingPermission(thePrivateKey, account, hsClientId);
        } catch (err) {
          error(_t("login.error-permission"));
          return;
        } finally {
          this.stateSet({ inProgress: false });
        }
      }
    }

    // Prepare hivesigner code
    const signer = (message: string): Promise<string> => {
      const hash = cryptoUtils.sha256(message);
      return new Promise<string>((resolve) => resolve(thePrivateKey.sign(hash).toString()));
    };
    const code = await makeHsCode(hsClientId, account.name, signer);

    this.stateSet({ inProgress: true });

    const { doLogin } = this.props;

    const generateKeysAfterLogin = (activeUser: ActiveUser) => {
      //decode user object.
      var user = ls.getByPrefix("user_").map((x) => {
        const u = decodeObj(x) as User;

        return {
          username: u.username,
          refreshToken: u.refreshToken,
          accessToken: u.accessToken,
          expiresIn: u.expiresIn,
          postingKey: u.postingKey
        };
      });

      var currentUser = user.filter((x) => x.username === activeUser?.username);
      //generate and store private keys in case of login with password.
      var keys: UserKeys = {};

      if (isPlainPassword) {
        keys = generateKeys(activeUser!, key);
      } else {
        if (withPostingKey) {
          keys = { posting: thePrivateKey.toString() };
        } else {
          keys = { active: thePrivateKey.toString() };
        }
      }

      const updatedUser: User = { ...currentUser[0], ...{ privateKeys: keys } };
      addUser(updatedUser);
    };

    doLogin(code, withPostingKey ? key : null, account)
      .then(() => {
        generateKeysAfterLogin(this.props.activeUser!);

        if (
          !ls.get(`${username}HadTutorial`) ||
          (ls.get(`${username}HadTutorial`) && ls.get(`${username}HadTutorial`) !== "true")
        ) {
          ls.set(`${username}HadTutorial`, "false");
        }

        let shouldShowTutorialJourney = ls.get(`${username}HadTutorial`);

        if (
          !shouldShowTutorialJourney &&
          shouldShowTutorialJourney &&
          shouldShowTutorialJourney === "false"
        ) {
          ls.set(`${username}HadTutorial`, "false");
        }
        this.hide();
      })
      .catch(() => {
        error(_t("g.server-error"));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  render() {
    const { username, key, inProgress, isVerified } = this.state;
    const { users, activeUser, global, userListRef } = this.props;
    const logo = global.isElectron ? "./img/logo-circle.svg" : require("../../img/logo-circle.svg");
    const hsLogo = global.isElectron
      ? "./img/hive-signer.svg"
      : require("../../img/hive-signer.svg");
    const keyChainLogo = global.isElectron
      ? "./img/keychain.png"
      : require("../../img/keychain.png");

    const spinner = <Spinner className="mr-[6px] w-3.5 h-3.5" />;

    return (
      <>
        {users.length === 0 && (
          <div className="dialog-header">
            <img src={logo} alt="Logo" />
            <h2>{_t("login.title")}</h2>
          </div>
        )}

        {users.length > 0 && (
          <>
            <div className="user-list" ref={userListRef}>
              <div className="user-list-header">{_t("g.login-as")}</div>
              <div className="user-list-body">
                {users.map((u) => {
                  return (
                    <UserItem
                      key={u.username}
                      {...this.props}
                      disabled={inProgress}
                      user={u}
                      onSelect={this.userSelect}
                      onDelete={this.userDelete}
                      containerRef={userListRef}
                    />
                  );
                })}
              </div>
            </div>
            <OrDivider />
          </>
        )}

        <Form
          className="login-form"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
          }}
        >
          <p className="login-form-text">{_t("login.with-user-pass")}</p>
          <Form.Group>
            <Form.Control
              type="text"
              value={username}
              onChange={this.usernameChanged}
              placeholder={_t("login.username-placeholder")}
              autoFocus={true}
              onKeyDown={this.inputKeyDown}
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              type="password"
              value={key}
              autoComplete="off"
              onChange={this.keyChanged}
              placeholder={_t("login.key-placeholder")}
              onKeyDown={this.inputKeyDown}
            />
          </Form.Group>
          {!global.isElectron && (
            <div className="google-recaptcha">
              <ReCAPTCHA
                sitekey="6LdEi_4iAAAAAO_PD6H4SubH5Jd2JjgbIq8VGwKR"
                onChange={this.captchaCheck}
                size="normal"
              />
            </div>
          )}
          <p className="login-form-text">
            {_t("login.login-info-1")}{" "}
            <a
              onClick={(e) => {
                e.preventDefault();
                this.hide();
                const { history } = this.props;
                history.push("/faq#how-to-signin");
                setTimeout(() => {
                  const el = document.getElementById("how-to-signin");
                  if (el) el.scrollIntoView();
                }, 300);
              }}
              href="#"
            >
              {_t("login.login-info-2")}
            </a>
          </p>
          <Button disabled={inProgress || !isVerified} block={true} onClick={this.login}>
            {inProgress && username && key && spinner}
            {_t("g.login")}
          </Button>
        </Form>
        <OrDivider />
        <div className="hs-login">
          <a
            className={_c(`btn btn-outline-primary ${inProgress ? "disabled" : ""}`)}
            onClick={this.hsLogin}
          >
            <img
              src={global.isElectron ? "./img/hive-signer.svg" : hsLogo}
              className="hs-logo"
              alt="hivesigner"
            />{" "}
            {_t("login.with-hive-signer")}
          </a>
        </div>
        {global.hasKeyChain && (
          <div className="kc-login">
            <a
              className={_c(`btn btn-outline-primary ${inProgress ? "disabled" : ""}`)}
              onClick={this.kcLogin}
            >
              <img src={keyChainLogo} className="kc-logo" alt="keychain" />{" "}
              {_t("login.with-keychain")}
            </a>
          </div>
        )}
        {activeUser === null && (
          <p>
            {_t("login.sign-up-text-1")}
            &nbsp;
            <a
              href="#"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                this.hide();

                const { history } = this.props;
                history.push("/signup");
              }}
            >
              {_t("login.sign-up-text-2")}
            </a>
          </p>
        )}
      </>
    );
  }
}

interface Props {
  history: History;
  location: Location;
  global: Global;
  ui: UI;
  users: User[];
  activeUser: ActiveUser | null;
  addUser: (user: User) => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
}

class LoginDialog extends Component<Props> {
  userListRef = React.createRef();

  hide = () => {
    const { toggleUIProp } = this.props;
    toggleUIProp("login");
  };

  componentWillUnmount() {
    const { toggleUIProp, ui } = this.props;
    if (ui.loginKc) {
      toggleUIProp("loginKc");
    }
  }

  doLogin = async (hsCode: string, postingKey: null | undefined | string, account: Account) => {
    const { global, setActiveUser, updateActiveUser, addUser } = this.props;

    // get access token from code
    return hsTokenRenew(hsCode).then((x) => {
      const user: User = {
        username: x.username,
        accessToken: x.access_token,
        refreshToken: x.refresh_token,
        expiresIn: x.expires_in,
        postingKey
      };

      // add / update user data
      addUser(user);

      // activate user
      setActiveUser(user.username);

      // add account data of the user to the reducer
      updateActiveUser(account);

      if (global.usePrivate) {
        // login activity
        usrActivity(user.username, 20);
      }

      // redirection based on path name
      const { location, history } = this.props;
      if (location.pathname.startsWith("/signup")) {
        const u = `/@${x.username}/feed`;
        history.push(u);
      }
    });
  };

  render() {
    const { ui } = this.props;

    return (
      <Modal
        show={true}
        centered={true}
        onHide={this.hide}
        className="login-modal"
        animation={false}
      >
        <ModalHeader thin={true} closeButton={true} />
        <ModalBody>
          {!ui.loginKc && (
            <Login {...this.props} doLogin={this.doLogin} userListRef={this.userListRef} />
          )}
          {ui.loginKc && <LoginKc {...this.props} doLogin={this.doLogin} />}
        </ModalBody>
      </Modal>
    );
  }
}

export default ({ history }: Pick<Props, "history">) => {
  const {
    global,
    ui,
    users,
    activeUser,
    addUser,
    setActiveUser,
    updateActiveUser,
    deleteUser,
    toggleUIProp
  } = useMappedStore();
  const location = useLocation();

  return (
    <LoginDialog
      history={history}
      location={location}
      global={global}
      ui={ui}
      users={users}
      activeUser={activeUser}
      addUser={addUser}
      setActiveUser={setActiveUser}
      updateActiveUser={updateActiveUser}
      deleteUser={deleteUser}
      toggleUIProp={toggleUIProp}
    />
  );
};
