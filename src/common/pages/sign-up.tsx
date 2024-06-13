import React, { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { connect } from "react-redux";
import qrcode from "qrcode";
import axios from "axios";
import queryString from "query-string";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { PREFIX } from "../util/local-storage";
import { signUp } from "../api/private-api";
import Feedback, { error } from "../components/feedback";
import { _t } from "../i18n";
import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import { appleSvg, checkSvg, googleSvg, hiveSvg } from "../img/svg";
import { Tsx } from "../i18n/helper";
import { handleInvalid, handleOnInput } from "../util/input-util";
import { getAccounts } from "../api/hive";
import "./sign-up.scss";
import { Link } from "react-router-dom";
import { b64uEnc } from "../util/b64";
import { Spinner } from "@ui/spinner";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import useDebounce from "react-use/lib/useDebounce";

enum Stage {
  FORM = "form",
  REGISTER_TYPE = "register-type",
  BUY_ACCOUNT = "buy-account"
}

declare var google: any;

export const SignUp = (props: PageProps) => {
  const [lsReferral, setLsReferral] = useLocalStorage<string>(PREFIX + "_referral");

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [referralError, setReferralError] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [referralTouched, setReferralTouched] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [referral, setReferral] = useState("");
  const [lockReferral, setLockReferral] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [done, setDone] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [stage, setStage] = useState<Stage>(Stage.FORM);
  const [url, setUrl] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [urlHash, setUrlHash] = useState("");

  const form = useRef<any>();
  const qrCodeRef = useRef<any>();

  const signupSvg = require("../img/signup.png");
  const logoCircle = require("../img/logo-circle.svg");

  useEffect(() => {
    const { referral } = queryString.parse(props.location.search);
    if (referral && typeof referral === "string") {
      setReferral(referral);
      setLockReferral(true);
    } else if (lsReferral && typeof lsReferral === "string") {
      props.history.push(`/signup?referral=${lsReferral}`);
      setReferral(lsReferral);
    } else {
      props.history.push("/signup");
    }
  }, []);

  useEffect(() => {
    if (stage === Stage.BUY_ACCOUNT) {
      const url = new URL("https://ecency.com");
      url.pathname = "purchase";

      const params = new URLSearchParams();
      params.set("username", username);
      params.set("email", email);
      params.set("referral", referral);
      params.set("type", "account");
      url.search = params.toString();

      setUrl(url.toString());
      compileQR(url.toString());
    }
  }, [stage]);

  useEffect(() => {
    setUsernameError("");
    setIsDisabled(false);

    if (!username && !usernameTouched) {
      return;
    }
    if (username.length > 16) {
      setUsernameError(_t("sign-up.username-max-length-error"));
      setIsDisabled(true);
    } else {
      username.split(".").some((item) => {
        if (item.length < 3) {
          setUsernameError(_t("sign-up.username-min-length-error"));
          setIsDisabled(true);
        } else if (!/^[\x00-\x7F]*$/.test(item[0])) {
          setUsernameError(_t("sign-up.username-no-ascii-first-letter-error"));
          setIsDisabled(true);
        } else if (!/^([a-zA-Z0-9]|-|\.)+$/.test(item)) {
          setUsernameError(_t("sign-up.username-contains-symbols-error"));
          setIsDisabled(true);
        } else if (item.includes("--")) {
          setUsernameError(_t("sign-up.username-contains-double-hyphens"));
          setIsDisabled(true);
        } else if (/^\d/.test(item)) {
          setUsernameError(_t("sign-up.username-starts-number"));
          setIsDisabled(true);
        }
      });
    }
  }, [username, usernameTouched]);

  useDebounce(
    () => {
      if (username?.length >= 3) {
        getAccounts([username]).then((r) => {
          if (r.length > 0) {
            setUsernameError(_t("sign-up.username-exists"));
            setIsDisabled(true);
          }
        });
      }
    },
    1000,
    [username]
  );

  useEffect(() => {
    if (email.length > 72) {
      setEmailError(_t("sign-up.email-max-length-error"));
    } else {
      setEmailError("");
    }
  }, [email]);

  useEffect(() => {
    setReferralError("");
    setIsDisabled(false);

    if (!referral) {
      return;
    }
    if (referral.length > 16) {
      setReferralError(_t("sign-up.referral-max-length-error"));
      setIsDisabled(true);
    } else {
      referral.split(".").some((item) => {
        if (item.length < 3) {
          setReferralError(_t("sign-up.referral-min-length-error"));
          setIsDisabled(true);
        }
      });
    }
  }, [referral, referralTouched]);

  const regularRegister = async () => {
    setInProgress(true);
    try {
      const response = await signUp(username, email, referral);
      if (!isVerified) {
        error(_t("login.captcha-check-required"));
        return;
      }
      if (response?.data?.code) {
        setRegistrationError(response.data.code);
      } else {
        setDone(true);
        setLsReferral(undefined);
        setStage(Stage.FORM);
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data?.message) {
        setRegistrationError(e.response.data.message);
      }
    } finally {
      setInProgress(false);
    }
  };

  const compileQR = async (url: string) => {
    if (qrCodeRef.current) {
      qrCodeRef.current.src = await qrcode.toDataURL(url, { width: 300 });
    }
  };

  const captchaCheck = (value: string | null) => {
    if (value) {
      setIsVerified(true);
    }
  };

  const handleSignUpClick = () => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: "106495050489-tm2kep6d89h1m1o4ejvmqcnh3qeusf02.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/userinfo.email",
      ux_mode: "redirect",
      prompt: "consent",
      include_granted_scopes: true,
      callback: (response: any) => {
        const requestOptions = {
          method: "GET",
          headers: {
            Authorization: `Bearer ${response.access_token}`,
            "Content-Type": "application/json"
          }
        };

        fetch("https://www.googleapis.com/oauth2/v3/userinfo", requestOptions)
          .then((response) => response.json())
          .then((data) => {
            setEmail(data.email);
            const userName = data.name
              ? data.name.toLowerCase().replace(/\s+/g, "")
              : data.email.split("@")[0];
            setUsername(userName);
          })
          .catch((err) => error(err));
      }
    });
    client.requestAccessToken();
  };

  const encodeUrlInfo = (username: string, email: string, referral: string) => {
    const accInfo = {
      username,
      email,
      referral
    };
    try {
      const stringifiedInfo = JSON.stringify(accInfo);
      const hashedInfo = b64uEnc(stringifiedInfo);
      setUrlHash(hashedInfo);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Meta title={_t("sign-up.header")} />
      <ScrollToTop />
      <Theme global={props.global} />
      <Feedback activeUser={props.activeUser} />
      <NavBar history={props.history} />
      <div className="app-content sign-up-page mb-lg-0">
        <div className="sign-up">
          <div className={"left-image " + stage}>
            <img src={signupSvg} alt="Signup" />
          </div>
          <div className="the-form">
            {stage === Stage.FORM ? (
              <>
                <div className="form-title">{_t("sign-up.header")}</div>
                <div className="form-sub-title">{_t("sign-up.description")}</div>
                <div className="flex items-center justify-center form-icons">
                  <img src={logoCircle} alt="Ecency" title="Ecency" />
                  <span title="Hive">{hiveSvg}</span>
                </div>

                <div className="flex items-center justify-center form-image">
                  <img src={signupSvg} alt="Signup" />
                </div>

                <div className="bottom-description text-center">
                  {_t("sign-up.bottom-description")}
                </div>

                <Tsx k="sign-up.learn-more">
                  <div className="form-faq" />
                </Tsx>

                {done ? (
                  <div className="form-done">
                    <div className="done-icon">{checkSvg}</div>
                    <div className="done-text">
                      <p>{_t("sign-up.success", { email })}</p>
                      <p>{_t("sign-up.success-2")}</p>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <></>
            )}
            {!done && stage === Stage.FORM ? (
              <div className="form-content">
                <Form
                  className="form-content"
                  ref={form}
                  onSubmit={async (e: React.FormEvent) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!form.current?.checkValidity()) {
                      return;
                    }

                    if (usernameError || referralError || emailError) {
                      return;
                    }

                    const existingAccount = await getAccounts([username]);
                    if (existingAccount.length > 0) {
                      setUsernameError(_t("sign-up.username-exists"));
                      return;
                    }

                    const referralIsValid = await getAccounts([referral]);
                    if (referralIsValid.length === 0 && referral !== "") {
                      setReferralError(_t("sign-up.referral-invalid"));
                      return;
                    }

                    if (stage === Stage.FORM) {
                      setStage(Stage.REGISTER_TYPE);
                    }

                    if ((username && email) || referral) {
                      encodeUrlInfo(username, email, referral);
                    }
                  }}
                >
                  <div className="mb-4">
                    <FormControl
                      type="text"
                      placeholder={_t("sign-up.username")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      autoFocus={true}
                      required={true}
                      onInvalid={(e: any) => handleInvalid(e, "sign-up.", "validation-username")}
                      aria-invalid={usernameError !== ""}
                      onInput={handleOnInput}
                      onBlur={() => setUsernameTouched(true)}
                    />
                    <small className="text-red pl-3">{usernameError}</small>
                  </div>
                  <div className="mb-4">
                    <FormControl
                      type="email"
                      placeholder={_t("sign-up.email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={true}
                      onInvalid={(e: any) => handleInvalid(e, "sign-up.", "validation-email")}
                      aria-invalid={emailError !== ""}
                      onInput={handleOnInput}
                    />
                    <small className="text-red pl-3">{emailError}</small>
                  </div>
                  <div className="mb-4">
                    <FormControl
                      type="text"
                      placeholder={_t("sign-up.ref")}
                      value={referral}
                      onChange={(e) => setReferral(e.target.value.toLowerCase())}
                      disabled={lockReferral}
                      aria-invalid={referralError !== ""}
                      onBlur={() => setReferralTouched(true)}
                    />
                    <small className="text-red pl-3">{referralError}</small>
                  </div>
                  <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                    <ReCAPTCHA
                      sitekey="6LdEi_4iAAAAAO_PD6H4SubH5Jd2JjgbIq8VGwKR"
                      onChange={captchaCheck}
                      size="normal"
                    />
                  </div>
                  {stage === Stage.FORM ? (
                    <>
                      <div className="flex justify-center">
                        <Button
                          className="block"
                          type="submit"
                          disabled={inProgress || !isVerified || isDisabled}
                          icon={inProgress && <Spinner className="w-3.5 h-3.5" />}
                          iconPlacement="left"
                        >
                          {_t("sign-up.submit")}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </Form>
                <Button className="google-signup-btn" onClick={handleSignUpClick}>
                  <span className="google-icon-wrapper">
                    <img
                      className="google-icon"
                      src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                      alt="Google logo"
                    />
                  </span>
                  <span className="btn-text">Sign up with Google</span>
                </Button>
                <div className="text-center">
                  {_t("sign-up.login-text-1")}
                  <a className="pl-1" href="#" onClick={(e) => props.toggleUIProp("login")}>
                    {_t("sign-up.login-text-2")}
                  </a>
                </div>
              </div>
            ) : (
              <></>
            )}

            {stage === Stage.REGISTER_TYPE ? (
              <div className="form-content">
                <div className="card border border-[--border-color] bg-white rounded mb-3 mt-5">
                  <div className="bg-gray-100 dark:bg-gray-800 border-b border-[--border-color] p-3">
                    <b>{_t("sign-up.free-account")}</b>
                  </div>
                  <div className="p-3">
                    <div>{_t("sign-up.free-account-desc")}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 border-t border-[--border-color] py-2 px-3">
                    <Button
                      className="w-full"
                      onClick={regularRegister}
                      icon={inProgress && <Spinner className="w-3.5 h-3.5" />}
                    >
                      {_t("sign-up.register-free")}
                    </Button>
                  </div>
                  {registrationError.length > 0 && (
                    <div className="error">
                      <small className="error-info">{registrationError}</small>
                    </div>
                  )}
                </div>
                <div className="card border bg-white border-[--border-color] rounded mb-3">
                  <div className="bg-gray-100 dark:bg-gray-800 border-b border-[--border-color] p-3">
                    <b>{_t("sign-up.buy-account")}</b>
                  </div>
                  <div className="p-3">
                    <p>{_t("sign-up.buy-account-desc")}</p>
                    <ul>
                      <li>{_t("sign-up.buy-account-li-1")}</li>
                      <li>{_t("sign-up.buy-account-li-2")}</li>
                      <li>{_t("sign-up.buy-account-li-3")}</li>
                    </ul>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 border-t border-[--border-color] py-2 px-3">
                    <Button className="w-full" onClick={() => setStage(Stage.BUY_ACCOUNT)}>
                      {_t("sign-up.buy-account")} – $2.99
                    </Button>
                  </div>
                </div>

                <div className="card border bg-white border-[--border-color] rounded mb-3">
                  <div className="bg-gray-100 dark:bg-gray-800 border-b border-[--border-color] p-3">
                    <b>
                      {props.activeUser
                        ? _t("onboard.title-active-user")
                        : _t("onboard.title-visitor")}
                    </b>
                  </div>
                  <div className="p-3">
                    <p>
                      {props.activeUser
                        ? _t("onboard.description-active-user")
                        : _t("onboard.description-visitor")}
                    </p>
                    <ul>
                      {props.activeUser && <li>{_t("onboard.creating-description")}</li>}
                      {!props.activeUser && <li>{_t("onboard.asking-description")}</li>}
                    </ul>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 border-t border-[--border-color] py-2 px-3">
                    <Link to={`/onboard-friend/asking/${urlHash}`}>
                      <Button className="w-full">
                        {props.activeUser ? _t("onboard.creating") : _t("onboard.asking")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}

            {stage === Stage.BUY_ACCOUNT ? (
              <div className="flex items-center flex-col justify-center">
                <div className="my-3">{_t("sign-up.qr-desc")}</div>
                <a href={url}>
                  <img ref={qrCodeRef} />
                </a>
                <div className="flex flex-col my-4 mb-16 gap-4 sm:flex-row">
                  <a href="https://ios.ecency.com" className="app-btn" target="_blank">
                    <i className="icon">{appleSvg}</i>
                    <span className="text">Download on the</span>
                    <span className="headline">AppStore</span>
                  </a>
                  <a href="https://android.ecency.com" className="app-btn" target="_blank">
                    <i className="icon">{googleSvg}</i>
                    <span className="text">Get it on</span>
                    <span className="headline">GooglePlay</span>
                  </a>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SignUp);
