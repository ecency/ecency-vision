import * as ls from "@/utils/local-storage";
import React, { useState } from "react";
import { cryptoUtils, PrivateKey, PublicKey } from "@hiveio/dhive";
import { Spinner } from "@ui/spinner";
import OrDivider from "@/features/shared/or-divider";
import { Form } from "@ui/form";
import { FormControl } from "@ui/input";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@ui/button";
import { Account, User, UserKeys } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { getAccount } from "@/api/hive";
import { decodeObj, generateKeys, getAuthUrl, getRefreshToken, makeHsCode } from "@/utils";
import i18next from "i18next";
import { error } from "@/features/shared";
import { grantPostingPermission } from "@/api/operations";
import { UserItem } from "@/features/shared/login/user-item";
import { useRouter } from "next/navigation";

interface Props {
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

export function Login({ doLogin, userListRef }: Props) {
  const hsClientId = useGlobalStore((state) => state.hsClientId);
  const activeUser = useGlobalStore((state) => state.activeUser);
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);
  const deleteUser = useGlobalStore((state) => state.deleteUser);
  const setActiveUser = useGlobalStore((state) => state.setActiveUser);
  const addUser = useGlobalStore((state) => state.addUser);
  const users = useGlobalStore((state) => state.users);
  const hasKeyChain = useGlobalStore((state) => state.hasKeyChain);

  const [username, setUsername] = useState("");
  const [key, setKey] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const router = useRouter();

  const userSelect = async (user: User) => {
    setInProgress(true);

    try {
      const account = await getAccount(user.username);
      let token = getRefreshToken(user.username);
      if (token) {
        await doLogin(token, user.postingKey, account);
        toggleUIProp("login");
        let shouldShowTutorialJourney = ls.get(`${user.username}HadTutorial`);

        if (
          !shouldShowTutorialJourney &&
          shouldShowTutorialJourney &&
          shouldShowTutorialJourney !== "true"
        ) {
          ls.set(`${user.username}HadTutorial`, "false");
        }
      } else {
        error(`${i18next.t("login.error-user-not-found-cache")}`);
        userDelete(user);
      }
    } catch (e) {
      error(i18next.t("g.server-error"));
    } finally {
      setInProgress(false);
    }
  };

  const userDelete = (user: User) => {
    deleteUser(user.username);

    // logout if active user
    if (activeUser && user.username === activeUser.username) {
      setActiveUser(null);
    }
  };

  const usernameChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value: username } = e.target;
    setUsername(username.trim().toLowerCase());
  };

  const keyChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value: key } = e.target;
    setKey(key.trim());
  };

  const inputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      login().then();
    }
  };

  const hsLogin = () => (window.location.href = getAuthUrl(hsClientId));
  const kcLogin = () => toggleUIProp("loginKc");

  const captchaCheck = (value: string | null) => {
    if (value) {
      setIsVerified(true);
    }
  };

  const generateKeysAfterLogin = (
    isPlainPassword: boolean,
    withPostingKey: boolean,
    thePrivateKey: PrivateKey
  ) => {
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

  const login = async () => {
    if (username === "" || key === "") {
      error(i18next.t("login.error-fields-required"));
      return;
    }
    if (!isVerified) {
      error(i18next.t("login.captcha-check-required"));
      return;
    }
    // Warn if the code is a public key
    try {
      PublicKey.fromString(key);
      error(i18next.t("login.error-public-key"));
      return;
    } catch (e) {}

    let account: Account;

    setInProgress(true);
    try {
      account = await getAccount(username);
    } catch (err) {
      error(i18next.t("login.error-user-fetch"));
      return;
    } finally {
      setInProgress(false);
    }

    if (!(account && account.name === username)) {
      error(i18next.t("login.error-user-not-found"));
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
        error(i18next.t("login.error-authenticate")); // enter master or active key
        return;
      }

      const hasPostingPerm =
        account?.posting!.account_auths.filter((x) => x[0] === hsClientId).length > 0;

      if (!hasPostingPerm) {
        setInProgress(true);
        try {
          await grantPostingPermission(thePrivateKey, account, hsClientId);
        } catch (err) {
          error(i18next.t("login.error-permission"));
          return;
        } finally {
          setInProgress(false);
        }
      }
    }

    // Prepare hivesigner code
    const signer = (message: string): Promise<string> => {
      const hash = cryptoUtils.sha256(message);
      return new Promise<string>((resolve) => resolve(thePrivateKey.sign(hash).toString()));
    };
    const code = await makeHsCode(hsClientId, account.name, signer);

    setInProgress(true);

    doLogin(code, withPostingKey ? key : null, account)
      .then(() => {
        generateKeysAfterLogin(isPlainPassword, withPostingKey, thePrivateKey);

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
        toggleUIProp("login");
      })
      .catch(() => {
        error(i18next.t("g.server-error"));
      })
      .finally(() => {
        setInProgress(false);
      });
  };

  const logo = require("../../../assets/img/logo-circle.svg");
  const hsLogo = require("../../../assets/img/hive-signer.svg");
  const keyChainLogo = require("../../../assets/img/keychain.png");

  const spinner = <Spinner className="mr-[6px] w-3.5 h-3.5" />;

  return (
    <>
      {users.length === 0 && (
        <div className="dialog-header flex flex-col items-center justify-center">
          <img src={logo} alt="Logo" />
          <h2>{i18next.t("login.title")}</h2>
        </div>
      )}

      {users.length > 0 && (
        <>
          <div className="user-list" ref={userListRef}>
            <div className="user-list-header">{i18next.t("g.login-as")}</div>
            <div className="user-list-body">
              {users.map((u) => {
                return (
                  <UserItem
                    key={u.username}
                    disabled={inProgress}
                    user={u}
                    onSelect={userSelect}
                    onDelete={userDelete}
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
        <p className="login-form-text mb-4">{i18next.t("login.with-user-pass")}</p>
        <div className="mb-4">
          <FormControl
            type="text"
            value={username}
            onChange={usernameChanged}
            placeholder={i18next.t("login.username-placeholder")}
            autoFocus={true}
            onKeyDown={inputKeyDown}
          />
        </div>
        <div className="mb-4">
          <FormControl
            type="password"
            value={key}
            autoComplete="off"
            onChange={keyChanged}
            placeholder={i18next.t("login.key-placeholder")}
            onKeyDown={inputKeyDown}
          />
        </div>
        <div className="google-recaptcha">
          <ReCAPTCHA
            sitekey="6LdEi_4iAAAAAO_PD6H4SubH5Jd2JjgbIq8VGwKR"
            onChange={captchaCheck}
            size="normal"
          />
        </div>
        <p className="login-form-text my-3">
          {i18next.t("login.login-info-1")}{" "}
          <a
            onClick={(e) => {
              e.preventDefault();
              toggleUIProp("login");
              router.push("/faq#how-to-signin");
              setTimeout(() => {
                const el = document.getElementById("how-to-signin");
                if (el) el.scrollIntoView();
              }, 300);
            }}
            href="#"
          >
            {i18next.t("login.login-info-2")}
          </a>
        </p>
        <Button full={true} disabled={inProgress || !isVerified} className="block" onClick={login}>
          {inProgress && username && key && spinner}
          {i18next.t("g.login")}
        </Button>
      </Form>
      <OrDivider />
      <div className="hs-login">
        <Button
          outline={true}
          onClick={hsLogin}
          disabled={inProgress}
          icon={<img src={hsLogo} className="hs-logo" alt="hivesigner" />}
          iconPlacement="left"
        >
          {i18next.t("login.with-hive-signer")}
        </Button>
      </div>
      {hasKeyChain && (
        <div className="kc-login">
          <Button
            outline={true}
            onClick={kcLogin}
            disabled={inProgress}
            icon={<img src={keyChainLogo} className="kc-logo" alt="keychain" />}
            iconPlacement="left"
          >
            {i18next.t("login.with-keychain")}
          </Button>
        </div>
      )}
      {activeUser === null && (
        <p>
          {i18next.t("login.sign-up-text-1")}
          &nbsp;
          <a
            href="#"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              toggleUIProp("login");
              router.push("/signup");
            }}
          >
            {i18next.t("login.sign-up-text-2")}
          </a>
        </p>
      )}
    </>
  );
}
