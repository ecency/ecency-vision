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
import { generatePassword, getPrivateKeys } from "../helper/onboard";
import { KeyTypes } from "../helper/onboard";
import { downloadSvg, copyContent } from "../img/svg";
import { hexEnc } from "../util/b64";
import { Link } from "react-router-dom";
import clipboard from "../util/clipboard";
import { ActiveUser } from "../store/active-user/types";
import { getAccount } from "../api/hive";
import { OffchainUser } from "../components/offchain-users";
import QRCode from "react-qr-code";

const HiveLogo = require("../img/hive-logo.jpeg");
const solanaLogo = require("../img/solanaLogo.png");

interface Props {
  activeUser: ActiveUser;
  global: Global
  communities: Community[]
}

const SignUpPage = (props: Props | any) => {
  const form = useRef(null);
  const { global, communities, activeUser } = props;

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [referral, setReferral] = useState("")
  const [urlHash, setUrlHash] = useState("")
  const [inProgress, setInProgress] = useState(false)
  const [community, setCommunity] = useState<Community | null>(null);
  const [newUserKeys, setNewUserKeys]: any = useState(null);
  const [accountPassword, setAccountPassword] = useState("")
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [accountType, setAccountType] = useState("Hive");

  useEffect(()=> {
    getCurrentCommunity()
  }, [])

  useEffect(()=> {
    initiateAccount()
  }, [step])

  const initiateAccount = async () => {
    if(!username || !email) {
      return;
    }

    try {
      const password: string = await generatePassword(32);
      const keys: KeyTypes = getPrivateKeys(username, password);
      setNewUserKeys((prev: any) => ({ ...prev, ...keys }));
      setAccountPassword(password)
      const dataToEncode = {
        username,
        email,
        referral,
        keys: {
          activePubKey: keys.activePubkey,
          postingPubKey: keys.postingPubkey,
          ownerPubKey: keys.ownerPubkey,
          memoPubKey: keys.memoPubkey
        }
      }
  
      const stringifiedData = JSON.stringify(dataToEncode);
      const hash = hexEnc(stringifiedData)
      setUrlHash(hash)
    } catch (err) {
        console.log(err)
    }
  }

  const usernameChanged = async (e: { target: { value: any; }; }) => {
    setInProgress(true)
    const { value: username } = e.target;
    setUsername(username.toLowerCase());
    const existingAccount = await getAccount(username)
    
    if (existingAccount){
      setError("username not available");
    } else {
      setError("")
    }
    setInProgress(false)
  };

  const emailChanged = (e: { target: { value: any; }; }) => {
    const { value: email } = e.target;
    setEmail(email.toLowerCase());
  };

  const referralChanged = (e: { target: { value: any; }; }) => {
    const { value: email } = e.target;
    setReferral(email.toLowerCase());
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

  const handleAccountTypeClick = (type: string) => {
    setAccountType(type);
  };

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
      <div className={`sign-up-page ${containerClasses}`}>
        <div className="signup-wrapper">
           {step  === 1 && <div className="account-types align-self-center d-flex">
              <h3>Sign up with</h3>
              <div 
              className="account-type"
              onClick={() => handleAccountTypeClick("Hive")}
              >
               <img
                    src={HiveLogo}
                    alt="Hive"
                    title="Hive"
                />
                <span
                  className={accountType === "Hive" ? "underline" : ""}>
                  Hive
                </span>
              </div>
              {/* <div 
              className="account-type"
              onClick={() => handleAccountTypeClick("Solana")}
              >
                <img
                    src={solanaLogo}
                    alt="Solana"
                    title="Solana"
                />
                <span
                  className={accountType === "Solana" ? "underline" : ""}>
                  Solana
                </span>
              </div> */}
            </div>}
            <div className="account-sign-up">
              {accountType === "Hive" && <>
                {step == 1 && <div className="sign-up">
                  <div className="the-form">
                    <div className="form-title">Create a Hive acoount</div>
                    <div className="form-sub-title">{_t("sign-up.description")}</div>
  
                    {(() => {
                      return (
                        <div className="form-content">
                          <Form
                            ref={form}
                            onSubmit={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if(error){
                                return;
                              }
                              setStep(2);
                            }}
                            >
                            <Form.Group className="d-flex flex-column">
                              {error && <span className="text-danger align-self-center mb-3">{error}</span>}
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
                                type="email"
                                placeholder={_t("sign-up.email")}
                                value={email}
                                onChange={emailChanged}
                                required={true}
                                onInvalid={(e: any) =>
                                  handleInvalid(e, "sign-up.", "validation-email")
                                }
                                onInput={handleOnInput}
                              />
                            </Form.Group>
                            <Form.Group>
                              <Form.Control
                                type="text"
                                placeholder={_t("sign-up.referral")}
                                value={referral}
                                onChange={referralChanged}
                                required={activeUser ? false : true}
                                onInvalid={(e: any) =>
                                  handleInvalid(e, "sign-up.", "validation-referral")
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
                {/* TEST */}
                {newUserKeys && step == 2 && <div className="success-wrapper">
                  <div className="success-info">
                    <h3>
                      Account creation steps
                    </h3>
                    <p>Please make sure you have keychain installed as an extension on your browser 
                      (If you are a using the web browser, we recommend that you pin it to your browser.)
                    </p>
                    {/* <p>If you are on mobile, download the keychain mobile app</p> */}
                    {/* <div className="d-flex">
                      <span className="">Don't have keychain? download</span>
                      <a className="ml-1" href="https://hive-keychain.com/" target="_blank" rel="noopener noreferrer">
                        here
                      </a>
                    </div> */}
                    <div className="account-details">
                        <span style={{ lineHeight: 2 }}>
                          {_t("onboard.username")} <strong>{username}</strong>
                        </span>
                    </div>
                    <div className="account-link">
                      <h3>Step 1</h3>
                      <span>Download your keys to continue</span>
                      <Button className="mt-3" onClick={()=> downloadKeys()}>{_t("onboard.download-keys")} {downloadSvg}</Button>
                    </div>
                    {isDownloaded && <div className="account-link">
                          <h3>Step 2</h3>
                            {!activeUser && <h5 className="text-danger">{_t("onboard.copy-info-message")}</h5>}
                            {activeUser && <h5 className="text-danger">Click link below or scan QR code</h5>}
                      <div className="link-wrap">
                        <div>
                          {!activeUser ? <>
                            <div className="link">
                              <Link to={`/onboard-friend/${urlHash}`}>{splitUrl(`${window.origin}/onboard-friend/${urlHash}`)}...</Link>
                              <span className="icon" onClick={() => {
                                clipboard(`${window.origin}/onboard-friend/${urlHash}`);
                                success(_t("onboard.copy-link"))
                              }}>{copyContent}</span>
                            </div>
                          </> : <a href={`${window.origin}/onboard-friend/${urlHash}`}>{_t("onboard.click-link")}</a>}
                        </div>
                        <div style={{ background: 'white', padding: '16px' }}>
                          <QRCode
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            value={`${window.origin}/onboard-friend/${urlHash}`}
                            viewBox={`0 0 256 256`}
                          />
                        </div>
                      </div>
                      <div className="account-password">
                      <h3>Step 3</h3>
                      {/* <span className="text-danger">{_t("onboard.copy-key")}</span> */}
                      <span>Confirm if your friend has created your account, then check your email for instructions on setting up your account and
                        <a className="ml-1" href="https://hive-keychain.com/" target="_blank" rel="noopener noreferrer">
                          download keychain extension here
                        </a>
                      </span>
                      {/* <span>If you are on mobile, download the keychain mobile app</span> */}
                      <div className="d-flex"> 
                        {/* <span className="">If you are on desktop</span> */}
                      </div>
                      <div className="d-flex flex-column align-items-center">
                        <h3>Step 4</h3>
                        <h4 className="text-danger">Copy your account password below and paste to keychain to set up your account</h4>
                        <div className="password">
                          <strong>{accountPassword}...</strong>
                          <span className="icon" onClick={()=> {
                            clipboard(accountPassword)
                            success(_t("onboard.key-copied"))
                            }}>{copyContent}</span>
                        </div>
                      </div>
                      </div>
                    </div>}
                  </div>
                </div>
                }
              </>}
              {accountType === "Solana" && <>
                <OffchainUser 
                  inProgress={inProgress} 
                  step={step} 
                  setStep={setStep} 
                  setInProgress={setInProgress}
                />
              </>}
            </div>
        </div>
      </div>
    </>
  );
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SignUpPage);
