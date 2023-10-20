import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { Button, Form, FormControl, Spinner } from "react-bootstrap";
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
import { Global } from "../store/global/types";

interface Props {
 global: Global
 communities: Community[]
}

const SignUpPage = (props: Props | any) => {
  const form = useRef(null);
  const { global, communities } = props;

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [lockReferral, setLockReferral] = useState(false)
  const [inProgress, setInProgress] = useState(false)
  const [community, setCommunity] = useState<Community | null>(null);
  const [newUserData, setNewUserData]: any = useState(null);
  const [step, setStep] = useState(1)

  useEffect(()=> {
    console.log(props)
    getCurrentCommunity()
  }, [])


  const usernameChanged = (e: { target: { value: any; }; }) => {
    const { value: username } = e.target;
    setUsername(username.toLowerCase());
  };
  const emailChanged = (e: { target: { value: any; }; }) => {
    const { value: email } = e.target;
    setEmail(email.toLowerCase());
  };

  // const submit = () => {
  //   const { global } = props;
  //   setInProgress(true);
  //   signUp(username, global.baseApiUrl)
  //     .then(({ data }) => {
  //       if (!data.success) {
  //         error(data.message);
  //         return;
  //       }
  //       setInProgress(false);
  //       setSignUpResponse(data)
  //     })
  //     .catch((e) => {
  //       console.error(e);
  //       setInProgress(false);
  //     });
  // };

  const createAccount = async () => {
    setStep(2)
  };

  const getCurrentCommunity = () => {
    const currCommunity = communities.find(
      (community: { name: any; }) => community.name === global.hive_id
    );
    setCommunity(currCommunity)
  }

  //  Meta config
  const metaProps = {
    title: `Welcome to ${community?.title}`,
  };

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
      <Theme global={props.global} />
      <Feedback />
      {global.isElectron
        ? NavBarElectron({
            ...props,
          })
        : NavBar({ ...props })}
      <div className={containerClasses}>
        {step == 1 && <div className="sign-up">
          <div className="the-form">
            <div className="form-title">Welcome to {community?.title}</div>
            <div className="form-sub-title">{_t("sign-up.description")}</div>
            <div className="form-icons">
              <img
                style={{ borderRadius: "50%" }}
                src={`${defaults.imageServer}/u/${global.hive_id}/avatar/lardge`}
                alt="Ecency"
                title="Ecency"
              />
              <span title="Hive">{hiveSvg}</span>
            </div>
            {(() => {
              return (
                <div className="form-content">
                  <Form
                    ref={form}
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      // if (!form.current?.checkValidity()) {
                      //   return;
                      // }

                      createAccount();
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
                        onInvalid={(e: any) =>
                          handleInvalid(e, "sign-up.", "validation-username")
                        }
                        onInput={handleOnInput}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Control
                        type="text"
                        placeholder={"Enter your email"}
                        value={email}
                        onChange={emailChanged}
                        // autoFocus={true}
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
                        const { toggleUIProp } = props;
                        toggleUIProp("login");
                      }}
                    >
                      {" "}
                      {_t("sign-up.login-text-2")}
                    </a>
                  </div>

                  {/* <div className="form-bottom-description text-center">
                    There are <b>{availibleAccounts}</b> free accounts left!
                  </div> */}
                </div>
              );
            })()}
          </div>
        </div>}
        {newUserData && step == 2 && (
          <div className="success-info">
            <h3>
              <b>Username</b>: {newUserData.result.username}
            </h3>
            <ul>
              <li>
                <b>Owner</b>: {newUserData.result.keys.owner}
              </li>
              <li>
                <b>Owner (public)</b>: {newUserData.result.keys.ownerPubkey}
              </li>
              <li>
                <b>Active</b>: {newUserData.result.keys.active}
              </li>
              <li>
                <b>Active (public)</b>: {newUserData.result.keys.activePubkey}
              </li>
              <li>
                <b>Posting</b>: {newUserData.result.keys.posting}
              </li>
              <li>
                <b>Posting (public)</b>: {newUserData.result.keys.postingPubkey}
              </li>
              <li>
                <b>Memo</b>: {newUserData.result.keys.memo}
              </li>
              <li>
                <b>Memo (public)</b>: {newUserData.result.keys.memoPubkey}
              </li>
            </ul>
            <h5>
              <b>
                This info is important for setting up your "HIVE Keychain" client,
                copy this info somewhere safe
              </b>
            </h5>
          </div>
        )}
      </div>
    </>
  );
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SignUpPage);
