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
import Feedback, { success, error } from "../components/feedback";
import ScrollToTop from "../components/scroll-to-top";
import defaults from "../constants/defaults.json";
import { _t } from "../i18n";
import { hiveSvg } from "../img/svg";
import { handleInvalid, handleOnInput } from "../util/input-util";
import { Community } from "../store/communities/types";
import { Global } from "../store/global/types";
import { createHiveAccount } from "../api/operations";
import { generatePassword, getPrivateKeys } from "../helper/onboard";
import { KeyTypes } from "../helper/onboard";
import { downloadSvg, copyContent } from "../img/svg";
import { b64uEnc } from "../util/b64";
import { Link } from "react-router-dom";
import clipboard from "../util/clipboard";

interface Props {
 global: Global
 communities: Community[]
}

const SignUpPage = (props: Props | any) => {
  const form = useRef(null);
  const { global, communities } = props;

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [urlHash, setUrlHash] = useState("")
  const [inProgress, setInProgress] = useState(false)
  const [community, setCommunity] = useState<Community | null>(null);
  const [newUserKeys, setNewUserKeys]: any = useState(null);
  const [accountPassword, setAccountPassword] = useState("")
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isDownloaded, setIsDownloaded] = useState(false)

  useEffect(()=> {
    console.log(props.match)
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
    console.log(keys)
    setNewUserKeys((prev: any) => ({ ...prev, ...keys }));
    setAccountPassword(await password)
    const dataToEncode = {
      username,
      keys: {
        activePubKey: keys.activePubkey,
        postingPubKey: keys.postingPubkey,
        ownerPubKey: keys.ownerPubkey,
        memoPubKey: keys.memoPubkey
      }
    }

    const stringifiedData = JSON.stringify(dataToEncode);
    const hash = encodeURIComponent(stringifiedData)
    setUrlHash(hash)
    // console.log(JSON.parse(b64uDec(hash)))
    console.log("stringifiedData", stringifiedData)

  }

  const usernameChanged = (e: { target: { value: any; }; }) => {
    const { value: username } = e.target;
    setUsername(username.toLowerCase());
  };
  const emailChanged = (e: { target: { value: any; }; }) => {
    const { value: email } = e.target;
    setEmail(email.toLowerCase());
  };

  const getCurrentCommunity = () => {
    const currCommunity = communities.find(
      (community: { name: any; }) => community.name === global.hive_id
    );
    setCommunity(currCommunity)
  }

  const splitUrl = (url: string) => {
    return url.slice(0, 50);
  };

  const downloadKeys = async () => {
    if (newUserKeys) {
      setIsDownloaded(false);
      const element = document.createElement("a");
      const keysToFile = `
          ${_t("onboard.file-warning")}
  
          ${_t("onboard.recommend")}
          1. ${_t("onboard.recommend-print")}
          2. ${_t("onboard.recommend-use")}
          3. ${_t("onboard.recommend-save")}
          4. ${_t("onboard.recommend-third-party")}

          ${_t("onboard.account-info")}

          Username: ${username}

          Password: ${accountPassword}

          ${_t("onboard.owner-private")} ${newUserKeys.owner}
  
          ${_t("onboard.active-private")} ${newUserKeys.active}
  
          ${_t("onboard.posting-private")} ${newUserKeys.posting}
  
          ${_t("onboard.memo-private")} ${newUserKeys.memo}
  
  
          ${_t("onboard.keys-use")}
          ${_t("onboard.owner")} ${_t("onboard.owner-use")}   
          ${_t("onboard.active")} ${_t("onboard.active-use")}  
          ${_t("onboard.posting")} ${_t("onboard.posting-use")} 
          ${_t("onboard.memo")} ${_t("onboard.memo-use")}`;

      const file = new Blob([keysToFile.replace(/\n/g, "\r\n")], {
        type: "text/plain"
      });
      element.href = URL.createObjectURL(file);
      element.download = `${username}_hive_keys.txt`;
      document.body.appendChild(element);
      element.click();
      setIsDownloaded(true);
    }
  };

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
            <Button onClick={()=> downloadKeys()}>Download keys {downloadSvg}</Button>
            {isDownloaded && <div className="account-link">
              <h3>Copy Link below and SEND to a friend</h3>
              <div className="link">
                <Link to={`${window.origin}/onboard-friend/${urlHash}`}>{splitUrl(`${window.origin}/onboard-friend/${urlHash}`)}</Link>
                <span className="icon" onClick={() => {
                  clipboard(`${window.origin}/onboard-friend/${urlHash}`);
                  success("Account link copied successfully")
                }}>{copyContent}</span>
              </div>
            </div>}
          </div>
        )}
      </div>
    </>
  );
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SignUpPage);
