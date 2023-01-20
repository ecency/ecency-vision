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
import { checkSvg, hiveSvg } from "../img/svg";
import { Tsx } from "../i18n/helper";
import { handleInvalid, handleOnInput } from "../util/input-util";
import ReCAPTCHA from "react-google-recaptcha";
import { connect } from "react-redux";

type FormChangeEvent = React.ChangeEvent<typeof FormControl & HTMLInputElement>;

export const SignUp = (props: PageProps) => {
  const [lsReferral, setLsReferral] = useLocalStorage<string>(PREFIX + "_referral");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [referral, setReferral] = useState("");
  const [lockReferral, setLockReferral] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [done, setDone] = useState(false);
  const [isVerified, setIsVerified] = useState(props.global.isElectron);

  const form = useRef<any>();

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

  const usernameChanged = (e: FormChangeEvent) => setUsername(e.target.value.toLowerCase());

  const emailChanged = (e: FormChangeEvent) => setEmail(e.target.value);

  const refCodeChanged = (e: FormChangeEvent) => setReferral(e.target.value.toLowerCase());

  const submit = async () => {
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

  const captchaCheck = (value: string | null) => value && setIsVerified(true);

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
          <div className="left-image">
            <img src={signupSvg} alt="Signup" />
          </div>
          <div className="the-form">
            <div className="form-title">{_t("sign-up.header")}</div>
            <div className="form-sub-title">{_t("sign-up.description")}</div>
            <div className="form-icons">
              <img src={logoCircle} alt="Ecency" title="Ecency" />
              <span title="Hive">{hiveSvg}</span>
            </div>

            <div className="form-image">
              <img src={signupSvg} alt="Signup" />
            </div>

            {(() => {
              // A test helper to simulate a successful form response.
              // const done = true;
              // const email = "loremipsum@gmail.com";

              if (done) {
                return (
                  <div className="form-done">
                    <div className="done-icon">{checkSvg}</div>
                    <div className="done-text">
                      <p>{_t("sign-up.success", { email })}</p>
                      <p>{_t("sign-up.success-2")}</p>
                    </div>
                  </div>
                );
              }

              return (
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

                      submit();
                    }}
                  >
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder={_t("sign-up.username")}
                        value={username}
                        onChange={usernameChanged}
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
                        onChange={emailChanged}
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
                        onChange={refCodeChanged}
                        disabled={lockReferral}
                      />
                    </Form.Group>
                    {!props.global.isElectron && (
                      <div style={{ marginTop: "16px", marginBottom: "5px" }}>
                        <ReCAPTCHA
                          sitekey="6LdEi_4iAAAAAO_PD6H4SubH5Jd2JjgbIq8VGwKR"
                          onChange={captchaCheck}
                          size="normal"
                        />
                      </div>
                    )}
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
                  </Form>

                  <div className="text-center">
                    {_t("sign-up.login-text-1")}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        props.toggleUIProp("login");
                      }}
                    >
                      {" "}
                      {_t("sign-up.login-text-2")}
                    </a>
                  </div>

                  <div className="form-bottom-description text-center">
                    {_t("sign-up.bottom-description")}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SignUp);
