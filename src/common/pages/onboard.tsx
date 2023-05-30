import React, { useEffect, useState } from "react";
import Meta from "../components/meta";
import { connect } from "react-redux";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import Feedback from "../components/feedback";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { Button, Modal } from "react-bootstrap";
import { copyContent, downloadSvg, regenerateSvg } from "../img/svg";
import { success } from "../components/feedback";
import Tooltip from "../components/tooltip";
import "./onboard.scss";
import { _t } from "../i18n";
import {
  generatePassword,
  getPrivateKeys,
  createAccountKc,
  createAccountWithCredit,
  getAcountCredit
} from "../api/operations";

export interface AccountInfo {
  email: string;
  username: string;
  keys: {
    active: string;
    activePubkey: string;
    memo: string;
    memoPubkey: string;
    owner: string;
    ownerPubkey: string;
    posting: string;
    postingPubkey: string;
  };
}

export interface DecodeHash {
  email: string;
  username: string;
  pub_keys: {
    active_public_key: string;
    memo_public_key: string;
    owner_public_key: string;
    posting_public_key: string;
  };
}

const Onboard = (props: PageProps | any) => {
  const onboardUrl = `${props.location.origin}/onboard-friend/creating/`;

  const [masterPassword, setMasterPassword] = useState("");
  const [hash, setHash] = useState("");
  const [accountInfo, setAccountInfo] = useState<AccountInfo>();
  const [decodedInfo, setDecodedInfo] = useState<DecodeHash>();
  const [showModal, setShowModal] = useState(false);
  const [accountCredit, setAccountCredit] = useState(0);
  const [createOption, setCreateOption] = useState("");
  const [fileIsDownloaded, setFileIsDownloaded] = useState(false);
  const [innerWidth, setInnerWidth] = useState(0);
  const [shortPassword, setShortPassword] = useState("");

  useEffect(() => {
    initAccountKey();
    try {
      if (props.match.params.hash) {
        const decodedHash = JSON.parse(decodeURIComponent(props.match.params.hash));
        setDecodedInfo(decodedHash);
        getCredit();
      }
    } catch (err) {
      console.log(err);
    }
  }, [props.global.accountName]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [masterPassword]);

  const handleResize = () => {
    setInnerWidth(window.innerWidth);
    let password: string = "";
    if (window.innerWidth <= 768 && window.innerWidth > 577) {
      password = masterPassword.substring(0, 32);
    } else if (window.innerWidth <= 577) {
      password = masterPassword.substring(0, 20);
    }
    setShortPassword(password);
  };

  const initAccountKey = async () => {
    try {
      const masterPassword: string = await generatePassword(32);
      const keys: any = getPrivateKeys(props.global.accountName, masterPassword);
      // prepare object to encode
      const pubKeys = {
        active_public_key: keys.activePubkey,
        memo_public_key: keys.memoPubkey,
        owner_public_key: keys.ownerPubkey,
        posting_public_key: keys.postingPubkey
      };

      const dataToEncode = {
        username: props.global.accountName,
        email: props.global.accountEmail,
        pubKeys
      };
      // stringify object to encode
      const stringifiedPubKeys = JSON.stringify(dataToEncode);
      const hashedPubKeys = encodeURIComponent(stringifiedPubKeys);
      setHash(hashedPubKeys);
      const accInfo = {
        username: props.global.accountName,
        email: props.global.accountEmail,
        keys
      };
      setAccountInfo(accInfo);
      setMasterPassword(masterPassword);
      return masterPassword;
    } catch (err: any) {
      console.error(err?.message);
      return null;
    }
  };

  const getCredit = async () => {
    const accountCredit = await getAcountCredit(props.activeUser.username);
    setAccountCredit(accountCredit);
  };

  const copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
  };

  const splitUrl = (url: string) => {
    return url.slice(0, 50);
  };

  const downloadKeys = async () => {
    if (accountInfo) {
      setFileIsDownloaded(false);
      const { username, keys } = accountInfo;
      const element = document.createElement("a");
      const keysToFile = `
          ${_t("onboard.file-warning")}
  
          ${_t("onboard.recomend")}
          1. ${_t("onboard.recomend-print")}
          2. ${_t("onboard.recomend-use")}
          3. ${_t("onboard.recomend-save")}
          4. ${_t("onboard.recomend-third-party")}
  
  
          ${_t("onboard.account-info")}
          Username: ${username}
  
          Password: ${masterPassword}
  
          ${_t("onboard.owner-private")} ${keys.owner}
  
          ${_t("onboard.active-private")} ${keys.active}
  
          ${_t("onboard.posting-private")} ${keys.posting}
  
          ${_t("onboard.memo-private")} ${keys.memo}
  
  
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
      setFileIsDownloaded(true);
    }
  };

  return (
    <>
      <Meta title="onborad" />
      <Theme global={props.global} />
      <Feedback activeUser={props.activeUser} />
      <NavBar history={props.history} />
      {props.match.params.type === "asking" && !props.activeUser && (
        <div className="onboard-container">
          <div className="asking">
            <div
              className={`asking-body d-flex mb-0 d-flex align-self-center flex-column ${
                innerWidth < 577 ? "p-3" : "p-5"
              }`}
            >
              <h3 className="mb-3 align-self-center">{_t("onboard.asking-confirm")}</h3>
              <div className="reg-details">
                <span style={{ lineHeight: 2 }}>
                  {_t("onboard.username")} <strong>{props.global.accountName}</strong>
                </span>
                <span style={{ lineHeight: 2 }}>
                  {_t("onboard.email")} <strong>{props.global.accountEmail}</strong>
                </span>
                <span style={{ lineHeight: 2 }}>
                  {_t("onboard.referral")} <strong>{props.global.referral}</strong>
                </span>
              </div>
              <span className="mt-3">{_t("onboard.copy-key")}</span>
              <div className="mt-3 d-flex flex-column align-center">
                <div className="d-flex">
                  <span className="mr-3 mt-1">
                    {innerWidth <= 768 ? shortPassword + "..." : masterPassword}
                  </span>
                  <Tooltip content={_t("onboard.copy-tooltip")}>
                    <span
                      className="onboard-svg mr-3"
                      onClick={() => {
                        copyToClipboard(masterPassword);
                        success(_t("onboard.copy-password"));
                      }}
                    >
                      {copyContent}
                    </span>
                  </Tooltip>
                  <Tooltip content={_t("onboard.regenerate-password")}>
                    <span className="onboard-svg" onClick={() => initAccountKey()}>
                      {regenerateSvg}
                    </span>
                  </Tooltip>
                </div>
                <Button
                  className="d-flex align-self-center justify-content-center mt-3"
                  disabled={!accountInfo?.username || !accountInfo.email}
                  onClick={() => {
                    downloadKeys();
                  }}
                >
                  <span>{_t("onboard.download-keys")}</span>
                  <span className="ml-2">{downloadSvg}</span>
                </Button>

                {fileIsDownloaded && (
                  <div className="d-flex flex-column align-self-center justify-content-center mt-3">
                    <h4>{_t("onboard.copy-info-message")}</h4>
                    <div className="d-flex align-items-center">
                      <span className="">{splitUrl(onboardUrl + hash)}...</span>
                      <span
                        style={{ width: "5%" }}
                        className="onboard-svg"
                        onClick={() => {
                          copyToClipboard(onboardUrl + hash);
                          success(_t("onboard.copy-link"));
                        }}
                      >
                        {copyContent}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {props.match.params.type === "creating" && props.match.params.hash && (
        <div className="onboard-container">
          {props.activeUser ? (
            <div className="creating-confirm">
              <h3 className="align-self-center">{_t("onboard.confirm-details")}</h3>
              <span>
                {_t("onboard.username")} {decodedInfo?.username}
              </span>
              <span>
                {_t("onboard.public-owner")} {decodedInfo?.pub_keys?.owner_public_key}
              </span>
              <span>
                {_t("onboard.public-active")} {decodedInfo?.pub_keys?.active_public_key}
              </span>
              <span>
                {_t("onboard.public-posting")} {decodedInfo?.pub_keys?.posting_public_key}
              </span>
              <span>
                {_t("onboard.public-memo")} {decodedInfo?.pub_keys?.memo_public_key}
              </span>
              <div className="creating-confirm-bottom">
                <span>{_t("onboard.pay-fee")}</span>
                <div className="onboard-btn-container">
                  <Button
                    className="align-self-center"
                    onClick={() => {
                      setCreateOption("hive");
                      setShowModal(true);
                    }}
                  >
                    {_t("onboard.create-account-hive")}
                  </Button>
                  <Button
                    className="align-self-center"
                    disabled={accountCredit <= 0}
                    onClick={() => {
                      setCreateOption("credit");
                      setShowModal(true);
                    }}
                  >
                    {_t("onboard.create-account-credit")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>{_t("onboard.login-warning")}</div>
          )}
        </div>
      )}
      <Modal
        animation={false}
        show={showModal}
        centered={true}
        onHide={() => setShowModal(false)}
        keyboard={false}
        className="transfer-dialog modal-thin-header"
        // size="lg"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title />
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column">
            <h4>{_t("onboard.modal-title")}</h4>
            {accountCredit <= 0 ||
              (createOption === "hive" && (
                <Button
                  className="w-50 align-self-center"
                  onClick={() => {
                    createAccountKc(
                      {
                        username: decodedInfo?.username,
                        pub_keys: decodedInfo?.pub_keys
                      },
                      props.activeUser.username
                    );
                    setShowModal(false);
                  }}
                >
                  {_t("onboard.modal-confirm")}
                </Button>
              ))}
            {accountCredit > 0 && createOption === "credit" && (
              <Button
                className="w-50 align-self-center"
                onClick={() => {
                  createAccountWithCredit(
                    {
                      username: decodedInfo?.username,
                      pub_keys: decodedInfo?.pub_keys
                    },
                    props.activeUser.username
                  );
                  setShowModal(false);
                }}
              >
                {_t("onboard.modal-confirm")}
              </Button>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(Onboard);
