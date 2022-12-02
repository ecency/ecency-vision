import React, { Component } from "react";

import { connect } from "react-redux";

import queryString from "query-string";

import { Button, Form, FormControl, Spinner, Row, Col } from "react-bootstrap";

import { PageProps, pageMapDispatchToProps, pageMapStateToProps } from "./common";

import ReCAPTCHA from "react-google-recaptcha";

import * as ls from "../../common/util/local-storage";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import Feedback, { error } from "../components/feedback";
import ScrollToTop from "../components/scroll-to-top";

import { signUp } from "../api/private-api";

import { _t } from "../i18n";
import { Tsx } from "../i18n/helper";

import { hiveSvg, checkSvg } from "../img/svg";
import { handleInvalid, handleOnInput } from "../util/input-util";

interface State {
  username: string;
  email: string;
  referral: string;
  lockReferral: boolean;
  inProgress: boolean;
  done: boolean;
  isVerified: boolean;
}

class SignUpPage extends Component<PageProps, State> {
  form = React.createRef<HTMLFormElement>();

  state: State = {
    username: "",
    email: "",
    referral: "",
    lockReferral: false,
    inProgress: false,
    done: false,
    isVerified: this.props.global.isElectron ? true : false
  };

  componentDidMount() {
    const { location, history } = this.props;
    const qs = queryString.parse(location.search);
    if (qs.referral) {
      const referral = qs.referral as string;
      this.setState({ referral, lockReferral: true });
    } else if (ls.get("referral")) {
      const referral = ls.get("referral");
      history.push(`/signup?referral=${referral}`);
      this.setState({ referral: referral });
    } else {
      history.push("/signup");
    }
  }

  usernameChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { value: username } = e.target;
    this.setState({ username: username.toLowerCase() });
  };

  emailChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { value: email } = e.target;
    this.setState({ email });
  };

  refCodeChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { value: referral } = e.target;
    this.setState({ referral: referral.toLowerCase() });
  };

  submit = () => {
    const { username, email, referral } = this.state;
    this.setState({ inProgress: true });
    signUp(username, email, referral)
      .then((resp) => {
        this.setState({ inProgress: false });
        if (!this.state.isVerified) {
          error(_t("login.captcha-check-required"));
          return;
        }
        if (resp && resp.data && resp.data.code) {
          error(resp.data.message);
        } else {
          this.setState({ done: true });
          ls.remove("referral");
        }
      })
      .catch((err) => {
        this.setState({ inProgress: false });
        if (err.response && err.response.data && err.response.data.message) {
          error(err.response.data.message);
        }
      });
  };

  captchaCheck = (value: string | null) => {
    if (value) {
      this.setState({ isVerified: true });
    }
  };

  render() {
    const { global } = this.props;

    const signupSvg = global.isElectron ? "./img/signup.png" : require("../img/signup.png");
    const logoCircle = global.isElectron
      ? "./img/logo-circle.svg"
      : require("../img/logo-circle.svg");

    //  Meta config
    const metaProps = {
      title: _t("sign-up.header")
    };

    const { username, email, referral, lockReferral, inProgress, done, isVerified } = this.state;
    const spinner = (
      <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
    );
    let containerClasses = global.isElectron
      ? "app-content sign-up-page mb-lg-0 mt-0 pt-6"
      : "app-content sign-up-page mb-lg-0";

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <Feedback activeUser={this.props.activeUser} />
        {global.isElectron
          ? NavBarElectron({
              ...this.props
            })
          : NavBar({ ...this.props })}
        <div className={containerClasses}>
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
                      ref={this.form}
                      onSubmit={(e: React.FormEvent) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (!this.form.current?.checkValidity()) {
                          return;
                        }

                        this.submit();
                      }}
                    >
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder={_t("sign-up.username")}
                          value={username}
                          onChange={this.usernameChanged}
                          autoFocus={true}
                          required={true}
                          onInvalid={(e: any) =>
                            handleInvalid(e, "sign-up.", "validation-username")
                          }
                          onInput={handleOnInput}
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Control
                          type="email"
                          placeholder={_t("sign-up.email")}
                          value={email}
                          onChange={this.emailChanged}
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
                          onChange={this.refCodeChanged}
                          disabled={lockReferral}
                        />
                      </Form.Group>
                      {!global.isElectron && (
                        <div style={{ marginTop: "16px", marginBottom: "5px" }}>
                          <ReCAPTCHA
                            sitekey="6LdEi_4iAAAAAO_PD6H4SubH5Jd2JjgbIq8VGwKR"
                            onChange={this.captchaCheck}
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
                          {inProgress && spinner} {_t("sign-up.submit")}
                        </Button>
                      </div>
                    </Form>

                    <div className="text-center">
                      {_t("sign-up.login-text-1")}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          const { toggleUIProp } = this.props;
                          toggleUIProp("login");
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
  }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SignUpPage);
