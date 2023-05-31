import React, { useEffect, useState } from "react";
import Meta from "../components/meta";
import { connect } from "react-redux";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import Feedback from "../components/feedback";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { Button, Modal } from "react-bootstrap";
import { copyContent, downloadSvg, regenerateSvg } from "../img/svg";
import { success, error } from "../components/feedback";
import Tooltip from "../components/tooltip";
import "./onboard.scss";
import { _t } from "../i18n";
import { createAccountKc, createAccountWithCredit, getAcountCredit } from "../api/operations";
import { generatePassword, getPrivateKeys } from "../helper/onBoard-helper";
import LinearProgress from "../components/linear-progress";

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
  pubkeys: {
    activepublickey: string;
    memopublickey: string;
    ownerpublickey: string;
    postingpublickey: string;
  };
}

export interface ConfirmDetails {
  label: string;
  value: string;
}

const createOptions = {
  HIVE: "hive",
  CREDIT: "credit"
};

const Onboard = (props: PageProps | any) => {
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
  const [confirmDetails, setConfirmDetails] = useState<ConfirmDetails[]>();
  const [onboardUrl, setOnboardUrl] = useState("");
  const [step, setStep] = useState(0);
  const [inProgress, setInprogress] = useState(false);

  useEffect(() => {
    setOnboardUrl(`${window.location.origin}/onboard-friend/creating/`);
    setInnerWidth(window.innerWidth);
  }, []);

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
    if (decodedInfo) {
      setConfirmDetails([
        { label: _t("onboard.username"), value: decodedInfo?.username },
        { label: _t("onboard.public-owner"), value: decodedInfo?.pubkeys?.ownerpublickey },
        { label: _t("onboard.public-active"), value: decodedInfo?.pubkeys?.activepublickey },
        { label: _t("onboard.public-posting"), value: decodedInfo?.pubkeys?.postingpublickey },
        { label: _t("onboard.public-memo"), value: decodedInfo?.pubkeys?.memopublickey }
      ]);
    }
  }, [decodedInfo]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
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
      const pubkeys = {
        activePublicKey: keys.activePubkey,
        memoPublicKey: keys.memoPubkey,
        ownerPublicKey: keys.ownerPubkey,
        postingPublicKey: keys.postingPubkey
      };

      const dataToEncode = {
        username: props.global.accountName,
        email: props.global.accountEmail,
        pubkeys
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
      error(err?.message);
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

  const createAccount = async (type: string) => {
    try {
      if (type === createOptions.HIVE) {
        const response = await createAccountKc(
          {
            username: decodedInfo?.username,
            pub_keys: decodedInfo?.pubkeys
          },
          props.activeUser.username
        );
        if (response) {
          setInprogress(false);
          setStep(2);
        }
      } else {
        const resp = await createAccountWithCredit(
          {
            username: decodedInfo?.username,
            pub_keys: decodedInfo?.pubkeys
          },
          props.activeUser.username
        );
        if (resp) {
          setInprogress(false);
          setStep(2);
        }
      }
    } catch (err: any) {
      error(err.message);
    }
  };

  const modelHeader = () => {
    return (
      <>
        <div className="create-account-dialog-header border-bottom">
          <div className="step-no">1</div>
          <div className="create-account-dialog-titles">
            <div className="create-account-main-title">
              {_t("onboard.sign-title")} {createOption}
            </div>
            <div className="create-account-sub-title">
              {_t("manage-authorities.sign-sub-title")}
            </div>
          </div>
        </div>
        {inProgress && <LinearProgress />}
      </>
    );
  };

  const modelContent = (type: string) => {
    return (
      <div className="model-content p-5">
        <div className="confirm-title">
          <h4>{_t("onboard.modal-title")}</h4>
        </div>

        <div className="buttons">
          <Button className="align-self-center" onClick={() => createAccount(type)}>
            {_t("onboard.modal-confirm")}
          </Button>

          <Button
            className="align-self-center cancel-btn"
            onClick={() => {
              setShowModal(false);
              setStep(0);
            }}
          >
            {_t("g.cancel")}
          </Button>
        </div>
      </div>
    );
  };

  const successModalBody = () => {
    return (
      <>
        <div className="create-account-success-dialog-header border-bottom d-flex">
          <div className="step-no">2</div>
          <div className="create-account-success-dialog-titles">
            <div className="create-account-main-title">{_t("trx-common.success-title")}</div>
            <div className="create-account-sub-title">{_t("trx-common.success-sub-title")}</div>
          </div>
        </div>

        <div className="success-dialog-body">
          <div className="success-dialog-content">
            <span>
              {_t("onboard.success-message")} <strong>{decodedInfo?.username}</strong>
            </span>
          </div>
          <div className="d-flex justify-content-center">
            <span className="hr-6px-btn-spacer" />
            <Button onClick={finish}>{_t("g.finish")}</Button>
          </div>
        </div>
      </>
    );
  };

  const finish = () => {
    setShowModal(false);
    setStep(0);
  };

  const modelBody = (type: string) => {
    return (
      <>
        {modelHeader()}
        {modelContent(type)}
      </>
    );
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
              <h3 className="mb-3 align-self-center">{_t("onboard.confirm-details")}</h3>
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
              {confirmDetails && (
                <>
                  {confirmDetails.map((field, index) => (
                    <span key={index}>
                      {field.label}
                      <strong style={{ wordBreak: "break-word", marginLeft: "10px" }}>
                        {field.value}
                      </strong>
                    </span>
                  ))}
                </>
              )}

              <div className="creating-confirm-bottom">
                <span>{_t("onboard.pay-fee")}</span>
                <div className="onboard-btn-container">
                  <Button
                    className="align-self-center"
                    onClick={() => {
                      setCreateOption("hive");
                      setShowModal(true);
                      setStep(1);
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
                      setStep(1);
                    }}
                  >
                    {_t("onboard.create-account-credit")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="login-warning">{_t("onboard.login-warning")}</div>
          )}
        </div>
      )}
      <Modal
        animation={false}
        show={showModal}
        centered={true}
        onHide={() => setShowModal(false)}
        keyboard={false}
        className="create-account-dialog modal-thin-header"
        size="lg"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title />
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column">
            {accountCredit <= 0 && createOption === createOptions.HIVE && (
              <React.Fragment>
                {step === 1 && modelBody(createOptions.HIVE)}
                {step === 2 && successModalBody()}
              </React.Fragment>
            )}
            {accountCredit > 0 && createOption === createOptions.CREDIT && (
              <React.Fragment>
                {step === 1 && modelBody(createOptions.CREDIT)}
                {step === 2 && successModalBody()}
              </React.Fragment>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(Onboard);
