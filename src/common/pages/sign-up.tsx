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
import { createHiveAccount } from "../api/operations";
import { generatePassword, getPrivateKeys } from "../helper/onboard";
import { KeyTypes } from "../helper/onboard";
import { downloadSvg, copyContent } from "../img/svg";

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
  const [newUserKeys, setNewUserKeys]: any = useState(null);
  const [accountPassword, setAccountPassword] = useState("")
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  useEffect(()=> {
    console.log(props)
    getCurrentCommunity()
  }, [])

  useEffect(()=> {
    initiateAccount()
  }, [step])

  const initiateAccount = async () => {
    if(!username || !email) {
      return;
    }

    const password: Promise<string> = generatePassword(32);
    const keys: KeyTypes = getPrivateKeys(username, password);
    setNewUserKeys((prev: any) => ({ ...prev, ...keys }));
    setAccountPassword(await password)
    console.log(newUserKeys)
    console.log("keys", keys)

    // setStep(2)

  }

  const usernameChanged = (e: { target: { value: any; }; }) => {
    const { value: username } = e.target;
    setUsername(username.toLowerCase());
  };
  const emailChanged = (e: { target: { value: any; }; }) => {
    const { value: email } = e.target;
    setEmail(email.toLowerCase());
  };

  const createAccount = async () => {
    
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
            <div className="form-title">Create a Hive acoount</div>
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

                      setStep(2);
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
                </div>
              );
            })()}
          </div>
        </div>}
        {newUserKeys && step == 2 && (
          <div className="success-info">
            <h3>
              Confirm Account Information
            </h3>
            <div className="account-details">
                <span style={{ lineHeight: 2 }}>
                  Username: <strong>{username}</strong>
                </span>
                <span style={{ lineHeight: 2 }}>
                  Email: <strong>{email}</strong>
                </span>
                <span style={{ lineHeight: 2 }}>
                  Active Public key: <strong>{newUserKeys?.activePubkey}</strong>
                </span>
                <span style={{ lineHeight: 2 }}>
                  Owner Public key: <strong>{newUserKeys?.ownerPubkey}</strong>
                </span>
                <span style={{ lineHeight: 2 }}>
                  Posting Public Key: <strong>{newUserKeys?.postingPubkey}</strong>
                </span>
                <span style={{ lineHeight: 2 }}>
                  Memo Public Key: <strong>{newUserKeys?.memoPubkey}</strong>
                </span>
            </div>
            <div className="account-password">
              <span>Make sure you copy and save ypur acc password securely</span>
              <div className="password">
                <strong>{accountPassword}</strong>
                <span className="icon">{copyContent}</span>
              </div>
            </div>
            <Button>Download keys {downloadSvg}</Button>
            <div className="account-link">
              <h3>Copy Link below and SEND to a friend</h3>
              <div className="link">
                <span>https://test.com/create-account</span>
                <span className="icon">{copyContent}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SignUpPage);
