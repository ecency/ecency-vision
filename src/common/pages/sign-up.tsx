import React, { useRef } from "react";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { useEffect, useState } from "react";
import queryString from "query-string";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../util/local-storage";
import { Button, Form, FormControl, Spinner } from "react-bootstrap";
import { signUp } from "../api/private-api";
import Feedback, { error } from "../components/feedback";
import { _t } from "../i18n";
import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import { appleSvg, checkSvg, googleSvg, hiveSvg } from "../img/svg";
import { Tsx } from "../i18n/helper";
import { handleInvalid, handleOnInput } from "../util/input-util";
import ReCAPTCHA from "react-google-recaptcha";
import { connect } from "react-redux";
import qrcode from "qrcode";
import { stat } from "fs";

type FormChangeEvent = React.ChangeEvent<typeof FormControl & HTMLInputElement>;

enum Stage {
  FORM = "form",
  REGISTER_TYPE = "register-type",
  BUY_ACCOUNT = "buy-account"
}

export const SignUp = (props: PageProps) => {
  const [lsReferral, setLsReferral] = useLocalStorage<string>(PREFIX + "_referral");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [referral, setReferral] = useState("");
  const [lockReferral, setLockReferral] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [done, setDone] = useState(false);
  const [isVerified, setIsVerified] = useState(props.global.isElectron);
  const [stage, setStage] = useState<Stage>(Stage.FORM);
  const [url, setUrl] = useState("");

  const form = useRef<any>();
  const qrCodeRef = useRef<any>();

  const signupSvg = props.global.isElectron ? "./img/signup.png" : require("../img/signup.png");
  const logoCircle = props.global.isElectron
    ? "./img/logo-circle.svg"
    : require("../img/logo-circle.svg");

  useEffect(() => {
    const { referral } = queryString.parse(props.location.search);
    if (referral && typeof referral === "string") {
      setReferral(referral);
      setLockReferral(true);
    } else if (lsReferral && typeof referral === "string") {
      props.history.push(`/signup?referral=${referral}`);
      setReferral(referral);
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

  const regularRegister = async () => {
    setInProgress(true);
    try {
      const response = await signUp(username, email, referral);
      if (isVerified) {
        error(_t("login.captcha-check-required"));
        return;
      }
      if (response?.data?.code) {
        error(response.data.code);
      } else {
        setDone(true);
        setLsReferral(undefined);
      }
    } catch (e) {
      if (e.response?.data?.message) {
        error(e.response.data.message);
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

  return (
    <>
      <Meta title={_t("sign-up.header")} />
      <ScrollToTop />
      <Theme global={props.global} />
      <Feedback activeUser={props.activeUser} />
      {props.global.isElectron ? NavBarElectron({ ...props }) : NavBar({ ...props })}
      <div
        className={
          props.global.isElectron
            ? "app-content sign-up-page mb-lg-0 mt-0 pt-6"
            : "app-content sign-up-page mb-lg-0"
        }
      >
        <div className="sign-up">
          <div className={"left-image " + stage}>
            <img src={signupSvg} alt="Signup" />
          </div>
          <div className="the-form">
            {!done && stage === Stage.FORM ? (
              <>
                <div className="form-title">{_t("sign-up.header")}</div>
                <div className="form-sub-title">{_t("sign-up.description")}</div>
                <div className="form-icons">
                  <img src={logoCircle} alt="Ecency" title="Ecency" />
                  <span title="Hive">{hiveSvg}</span>
                </div>

                <div className="form-image">
                  <img src={signupSvg} alt="Signup" />
                </div>
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
                <Tsx k="sign-up.learn-more">
                  <div className="form-faq" />
                </Tsx>

                <Form
                  ref={form}
                  onSubmit={(e: React.FormEvent) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!form.current?.checkValidity()) {
                      return;
                    }

                    if (stage === Stage.FORM) {
                      setStage(Stage.REGISTER_TYPE);
                    }
                  }}
                >
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder={_t("sign-up.username")}
                      value={username}
                      onChange={(e: FormChangeEvent) => setUsername(e.target.value.toLowerCase())}
                      autoFocus={true}
                      required={true}
                      onInvalid={(e: any) => handleInvalid(e, "sign-up.", "validation-username")}
                      onInput={handleOnInput}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Control
                      type="email"
                      placeholder={_t("sign-up.email")}
                      value={email}
                      onChange={(e: FormChangeEvent) => setEmail(e.target.value)}
                      required={true}
                      onInvalid={(e: any) => handleInvalid(e, "sign-up.", "validation-email")}
                      onInput={handleOnInput}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      placeholder={_t("sign-up.ref")}
                      value={referral}
                      onChange={(e: FormChangeEvent) => setReferral(e.target.value.toLowerCase())}
                      disabled={lockReferral}
                    />
                  </Form.Group>
                  {!props.global.isElectron && (
                    <div style={{ marginTop: "16px", marginBottom: "7px" }}>
                      <ReCAPTCHA
                        sitekey="6LdEi_4iAAAAAO_PD6H4SubH5Jd2JjgbIq8VGwKR"
                        onChange={(value: string | null) => value && setIsVerified(true)}
                        size="normal"
                      />
                    </div>
                  )}
                  {stage === Stage.FORM ? (
                    <>
                      <div className="d-flex justify-content-center">
                        <Button
                          variant="primary"
                          block={true}
                          type="submit"
                          disabled={inProgress || !isVerified}
                        >
                          {inProgress && (
                            <Spinner
                              animation="grow"
                              variant="light"
                              size="sm"
                              style={{ marginRight: "6px" }}
                            />
                          )}
                          {_t("sign-up.submit")}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </Form>
                <div className="text-center">
                  {_t("sign-up.login-text-1")}
                  <a className="pl-1" href="#" onClick={(e) => props.toggleUIProp("login")}>
                    {_t("sign-up.login-text-2")}
                  </a>
                </div>

                <div className="form-bottom-description text-center">
                  {_t("sign-up.bottom-description")}
                </div>
              </div>
            ) : (
              <></>
            )}

            {stage === Stage.REGISTER_TYPE ? (
              <div className="form-content">
                <div className="card mb-3">
                  <div className="card-header">
                    <b>{_t("sign-up.free-account")}</b>
                  </div>
                  <div className="card-body">
                    <div>{_t("sign-up.free-account-desc")}</div>
                  </div>
                  <div className="card-footer">
                    <Button variant="primary" className="w-100" onClick={regularRegister}>
                      {_t("sign-up.register-free")}
                    </Button>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <b>{_t("sign-up.buy-account")}</b>
                  </div>
                  <div className="card-body">
                    <p>{_t("sign-up.buy-account-desc")}</p>
                    <ul>
                      <li>{_t("sign-up.buy-account-li-1")}</li>
                      <li>{_t("sign-up.buy-account-li-2")}</li>
                      <li>{_t("sign-up.buy-account-li-3")}</li>
                    </ul>
                  </div>
                  <div className="card-footer">
                    <Button
                      className="w-100"
                      variant="primary"
                      onClick={() => setStage(Stage.BUY_ACCOUNT)}
                    >
                      {_t("sign-up.buy-account")} – $2.99
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}

            {stage === Stage.BUY_ACCOUNT ? (
              <div className="d-flex align-items-center flex-column justify-content-center">
                <div className="my-3">{_t("sign-up.qr-desc")}</div>
                <a href={url}>
                  <img ref={qrCodeRef} />
                </a>
                <div className="d-flex flex-column flex-sm-row">
                  <a
                    href="https://ios.ecency.com"
                    className="btn app-btn mb-2 mb-sm-0 mr-sm-2"
                    target="_blank"
                  >
                    <i className="icon">{appleSvg}</i>
                    <span className="text">Download on the</span>
                    <span className="headline">AppStore</span>
                  </a>
                  <a href="https://android.ecency.com" className="btn app-btn" target="_blank">
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
