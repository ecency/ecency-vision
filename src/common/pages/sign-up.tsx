import React, { Component } from "react";

import { connect } from "react-redux";

import { Button, Form, FormControl, Spinner, Row, Col } from "react-bootstrap";

import {
  PageProps,
  pageMapDispatchToProps,
  pageMapStateToProps,
} from "./common";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import Feedback, { error } from "../components/feedback";
import ScrollToTop from "../components/scroll-to-top";
import defaults from "../constants/defaults.json";

import { getAvailibleAccounts, signUp } from "../api/private-api";

import { _t } from "../i18n";

import { hiveSvg } from "../img/svg";
import { handleInvalid, handleOnInput } from "../util/input-util";
import { Community } from "../store/communities/types";
import { windowExists } from "../../server/util";

interface State {
  username: string;
  lockReferral: boolean;
  inProgress: boolean;
  done: boolean;
  availibleAccounts: number;
  signUpResponse: any;
  communities: Community[];
}

class SignUpPage extends Component<PageProps, State> {
  form = React.createRef<HTMLFormElement>();

  state: State = {
    username: "",
    lockReferral: false,
    inProgress: false,
    done: false,
    communities: [],
    availibleAccounts: 0,
    signUpResponse: null,
  };

  componentDidMount() {
    const { global } = this.props;
    getAvailibleAccounts(global.baseApiUrl)
      .then((response) => {
        this.setState({ ...this.state, availibleAccounts: response.count });
        if (!response.count) {
          if (windowExists) {
            window.location.replace("https://signup.hive.io/");
          }
        }
      })
      .catch((e) => {
        if (windowExists) {
          window.location.replace("https://signup.hive.io/");
        }
      });
  }

  usernameChanged = (
    e: React.ChangeEvent<typeof FormControl & HTMLInputElement>
  ) => {
    const { value: username } = e.target;
    this.setState({ username: username.toLowerCase() });
  };

  submit = () => {
    const { username } = this.state;
    const { global } = this.props;
    this.setState({ ...this.state, inProgress: true });
    signUp(username, global.baseApiUrl)
      .then(({ data }) => {
        if (!data.success) {
          error(data.message);
          return;
        }

        this.setState({ inProgress: false, signUpResponse: data });
      })
      .catch((e) => {
        console.error(e);
        this.setState({ inProgress: false });
        error("Couldn't create account");
      });
  };

  render() {
    const { global, communities } = this.props;
    const currCommunity = communities.find(
      (community) => community.name === global.hive_id
    );

    //  Meta config
    const metaProps = {
      title: `Welcome to ${currCommunity?.title}`,
    };

    const { username, inProgress, done, availibleAccounts, signUpResponse } =
      this.state;
    const spinner = (
      <Spinner
        animation="grow"
        variant="light"
        size="sm"
        style={{ marginRight: "6px" }}
      />
    );
    let containerClasses = global.isElectron
      ? "app-content sign-up-page mb-lg-0 mt-0 pt-6"
      : "app-content sign-up-page mb-lg-0";

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <Feedback />
        {global.isElectron
          ? NavBarElectron({
              ...this.props,
            })
          : NavBar({ ...this.props })}
        <div className={containerClasses}>
          {signUpResponse && (
            <div className="success-info">
              <h3>
                <b>Username</b>: {signUpResponse.result.username}
              </h3>
              <ul>
                <li>
                  <b>Owner</b>: {signUpResponse.result.keys.owner}
                </li>
                <li>
                  <b>Owner (public)</b>:{" "}
                  {signUpResponse.result.keys.ownerPubkey}
                </li>
                <li>
                  <b>Active</b>: {signUpResponse.result.keys.active}
                </li>
                <li>
                  <b>Active (public)</b>:{" "}
                  {signUpResponse.result.keys.activePubkey}
                </li>
                <li>
                  <b>Posting</b>: {signUpResponse.result.keys.posting}
                </li>
                <li>
                  <b>Posting (public)</b>:{" "}
                  {signUpResponse.result.keys.postingPubkey}
                </li>
                <li>
                  <b>Memo</b>: {signUpResponse.result.keys.memo}
                </li>
                <li>
                  <b>Memo (public)</b>: {signUpResponse.result.keys.memoPubkey}
                </li>
              </ul>
              <h5>
                <b>
                  This info is important to setting up your "HIVE Keychain"
                  client, copy this info somewhere safe
                </b>
              </h5>
            </div>
          )}
          <div className="sign-up">
            <div className="the-form">
              <div className="form-title">
                Welcome to {currCommunity?.title}
              </div>
              <div className="form-sub-title">{_t("sign-up.description")}</div>
              <div className="form-icons">
                <img
                  src={`${defaults.imageServer}/u/${currCommunity?.name}/avatar/lardge`}
                  alt="Ecency"
                  title="Ecency"
                />
                <span title="Hive">{hiveSvg}</span>
              </div>
              {(() => {
                // A test helper to simulate a successful form response.
                // const done = true;
                // const email = "loremipsum@gmail.com";

                return (
                  <div className="form-content">
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
                      <div className="d-flex justify-content-center">
                        <Button
                          variant="primary"
                          block={true}
                          type="submit"
                          disabled={inProgress}
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
                      There are <b>{availibleAccounts}</b> free accounts left!
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
