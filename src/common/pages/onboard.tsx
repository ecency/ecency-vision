import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { match } from "react-router";
import { PrivateKey } from "@hiveio/dhive";
import { Link } from "react-router-dom";

import Meta from "../components/meta";
import { connect } from "react-redux";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import Feedback from "../components/feedback";
import { success, error } from "../components/feedback";
import Tooltip from "../components/tooltip";
import LinearProgress from "../components/linear-progress";
import keyOrHot from "../components/key-or-hot";

import { FullAccount } from "../store/accounts/types";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import {
  createAccountKc,
  createAccountHs,
  createAccountKey,
  createAccountWithCreditKc,
  createAccountWithCreditHs,
  createAccountWithCreditKey
} from "../api/operations";
import { onboardEmail } from "../api/private-api";
import { generatePassword, getPrivateKeys } from "../helper/onBoard-helper";
import { b64uDec, b64uEnc } from "../util/b64";
import clipboard from "../util/clipboard";

import { copyContent, downloadSvg, regenerateSvg } from "../img/svg";
import { _t } from "../i18n";
import "./onboard.scss";

export interface AccountInfo {
  email: string;
  username: string;
  referral: string;
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
    ownerPublicKey: string;
    activePublicKey: string;
    postingPublicKey: string;
    memoPublicKey: string;
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

interface MatchParams {
  secret?: string;
  type: string;
  id: string;
}

interface Props extends PageProps {
  match: match<MatchParams>;
}

const Onboard = (props: Props) => {
  const [masterPassword, setMasterPassword] = useState("");
  const [secret, setSecret] = useState("");
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
  const [step, setStep] = useState<string | number>(0);
  const [inProgress, setInprogress] = useState(false);

  useEffect(() => {
    setOnboardUrl(`${window.location.origin}/onboard-friend/creating/`);
    setInnerWidth(window.innerWidth);
    try {
      if (props.match.params.secret && props.match.params.type !== "asking") {
        const decodedHash = JSON.parse(b64uDec(props.match.params.secret));
        setDecodedInfo(decodedHash);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    if (props.match.params.type == "asking") {
      initAccountKey();
    }
  }, [accountInfo?.username]);

  useEffect(() => {
    const { activeUser } = props;
    (activeUser?.data as FullAccount) &&
      (activeUser?.data as FullAccount).pending_claimed_accounts &&
      setAccountCredit((activeUser?.data as FullAccount).pending_claimed_accounts);
  }, [props.activeUser]);

  useEffect(() => {
    if (decodedInfo) {
      setConfirmDetails([
        { label: _t("onboard.username"), value: decodedInfo?.username },
        { label: _t("onboard.public-owner"), value: decodedInfo?.pubkeys?.ownerPublicKey },
        { label: _t("onboard.public-active"), value: decodedInfo?.pubkeys?.activePublicKey },
        { label: _t("onboard.public-posting"), value: decodedInfo?.pubkeys?.postingPublicKey },
        { label: _t("onboard.public-memo"), value: decodedInfo?.pubkeys?.memoPublicKey }
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
    const urlInfo = props.match.url.split("/")[3];
    try {
      const info = JSON.parse(b64uDec(urlInfo));
      const masterPassword: string = await generatePassword(32);
      const keys: any = getPrivateKeys(info?.username, masterPassword);
      // prepare object to encode
      const pubkeys = {
        activePublicKey: keys.activePubkey,
        memoPublicKey: keys.memoPubkey,
        ownerPublicKey: keys.ownerPubkey,
        postingPublicKey: keys.postingPubkey
      };

      const dataToEncode = {
        username: info.username,
        email: info.email,
        pubkeys
      };
      // stringify object to encode
      const stringifiedPubKeys = JSON.stringify(dataToEncode);
      const hashedPubKeys = b64uEnc(stringifiedPubKeys);
      setSecret(hashedPubKeys);
      const accInfo = {
        username: info.username?.replace(/[=+]/g, "."),
        email: info.email?.replace("=", "."),
        referral: info.referral?.replace(/[=+]/g, "."),
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

  const sendMail = async (email: string = accountInfo!.email) => {
    const { activeUser } = props;
    const username = decodedInfo!.username || accountInfo!.username;
    if (activeUser) {
      await onboardEmail(username, email.replace("=", "."), activeUser?.username);
    }
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
  
          ${_t("onboard.recommend")}
          1. ${_t("onboard.recommend-print")}
          2. ${_t("onboard.recommend-use")}
          3. ${_t("onboard.recommend-save")}
          4. ${_t("onboard.recommend-third-party")}

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

  const onKc = async (type: string) => {
    const { activeUser, dynamicProps } = props;
    if (activeUser) {
      try {
        if (type === createOptions.HIVE) {
          const resp = await createAccountKc(
            {
              username: decodedInfo?.username,
              pub_keys: decodedInfo?.pubkeys,
              fee: dynamicProps.accountCreationFee
            },
            activeUser?.username
          );
          if (resp.success == true) {
            setInprogress(false);
            setStep("success");
            sendMail();
          } else {
            setStep("failed");
          }
        } else {
          const resp = await createAccountWithCreditKc(
            {
              username: decodedInfo?.username,
              pub_keys: decodedInfo?.pubkeys
            },
            activeUser?.username
          );
          if (resp.success == true) {
            setInprogress(false);
            setStep("success");
            sendMail();
          } else {
            setStep("failed");
          }
        }
      } catch (err: any) {
        if (err) {
          setStep("failed");
        }
        error(err.message);
      }
    }
  };

  const onKey = async (type: string, key: PrivateKey) => {
    const { activeUser, dynamicProps } = props;
    if (activeUser) {
      try {
        if (type === createOptions.HIVE) {
          const resp = await createAccountKey(
            {
              username: decodedInfo?.username,
              pub_keys: decodedInfo?.pubkeys,
              fee: dynamicProps.accountCreationFee
            },
            activeUser?.username,
            key
          );
          if (resp.id) {
            setInprogress(false);
            setStep("success");
            sendMail();
          } else {
            setStep("failed");
          }
        } else {
          const resp = await createAccountWithCreditKey(
            {
              username: decodedInfo?.username,
              pub_keys: decodedInfo?.pubkeys
            },
            activeUser?.username,
            key
          );
          if (resp.id) {
            setInprogress(false);
            setStep("success");
            sendMail();
          } else {
            setStep("failed");
          }
        }
      } catch (err: any) {
        if (err) {
          setStep("failed");
        }
        error(err.message);
      }
    }
  };

  const onHot = async (type: string) => {
    const { activeUser, dynamicProps } = props;
    const dataToEncode = {
      username: decodedInfo!.username,
      email: decodedInfo!.email
    };
    const stringifiedPubKeys = JSON.stringify(dataToEncode);
    const hashedInfo = b64uEnc(stringifiedPubKeys);
    if (activeUser) {
      try {
        if (type === createOptions.HIVE) {
          const resp = await createAccountHs(
            {
              username: decodedInfo?.username,
              pub_keys: decodedInfo?.pubkeys,
              fee: dynamicProps.accountCreationFee
            },
            activeUser?.username,
            hashedInfo
          );
          if (resp) {
            setInprogress(false);
            setShowModal(false);
            // sendMail();
          }
        } else {
          const resp = await createAccountWithCreditHs(
            {
              username: decodedInfo?.username,
              pub_keys: decodedInfo?.pubkeys
            },
            activeUser?.username,
            hashedInfo
          );
          if (resp) {
            setInprogress(false);
            setShowModal(false);
            // sendMail();
          }
        }
      } catch (err: any) {
        if (err) {
          setShowModal(false);
        }
        error(err.message);
      }
    }
  };

  const signTransactionModal = (type: string) => {
    return (
      <>
        <div className="border-bottom d-flex align-items-center">
          <div className="step-no">2</div>
          <div>
            <div>{_t("onboard.sign-header-title")}</div>
            <div>{_t("onboard.sign-sub-title")}</div>
          </div>
        </div>
        {inProgress && <LinearProgress />}
        {keyOrHot({
          global: props.global,
          activeUser: props.activeUser,
          signingKey: props.signingKey,
          setSigningKey: props.setSigningKey,
          inProgress: inProgress,
          onKey: (key) => {
            onKey(type, key);
          },
          onHot: () => {
            onHot(type);
          },
          onKc: () => {
            onKc(type);
          }
        })}
        <p className="text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowModal(false);
            }}
          >
            {_t("g.back")}
          </a>
        </p>
      </>
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
  const failedModalBody = () => {
    return (
      <>
        <div className="create-account-success-dialog-header border-bottom d-flex text-danger">
          <div className="step-no">❌</div>
          <div className="create-account-success-dialog-titles">
            <div className="create-account-main-title">{_t("onboard.failed-title")}</div>
            <div className="create-account-sub-title">{_t("onboard.failed-subtitle")}</div>
          </div>
        </div>

        <div className="success-dialog-body">
          <div className="success-dialog-content">
            <span className="text-danger">{_t("onboard.failed-message")}</span>
          </div>
          <div className="d-flex justify-content-center">
            <span className="hr-6px-btn-spacer" />
            <Button onClick={finish}>{_t("onboard.try-again")}</Button>
          </div>
        </div>
      </>
    );
  };

  const finish = () => {
    setShowModal(false);
    setStep(0);
  };

  return (
    <>
      <Meta title="Onboarding a Friend" />
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
                  {_t("onboard.username")} <strong>{accountInfo?.username}</strong>
                </span>
                <span style={{ lineHeight: 2 }}>
                  {_t("onboard.email")} <strong>{accountInfo?.email}</strong>
                </span>
                <span style={{ lineHeight: 2 }}>
                  {_t("onboard.referral")} <strong>{accountInfo?.referral}</strong>
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
                        clipboard(masterPassword);
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
                      <span className="">{splitUrl(onboardUrl + secret)}...</span>
                      <span
                        style={{ width: "5%" }}
                        className="onboard-svg"
                        onClick={() => {
                          clipboard(onboardUrl + secret);
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

      {props.match.params.type === "creating" && props.match.params.secret && (
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
                      setStep("sign");
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
                      setStep("sign");
                    }}
                  >
                    {_t("onboard.create-account-credit", { n: accountCredit })}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="login-warning">{_t("onboard.login-warning")}</div>
          )}
        </div>
      )}

      {props.match.params.type === "confirming" && (
        <div className="onboard-container">
          <div className="login-warning">
            <span>
              {_t("onboard.success-message")} <strong>@{decodedInfo?.username}</strong>
            </span>
          </div>
          <Button
            as={Link}
            to={`/@${decodedInfo?.username}`}
            className="mt-3 w-50 align-self-center"
            onClick={() => {
              const { location } = props;
              const queryParams = new URLSearchParams(location.search);
              if (queryParams.has("tid")) {
                sendMail(decodedInfo?.email);
              }
            }}
          >
            {_t("g.finish")}
          </Button>
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
            {createOption === createOptions.HIVE && (
              <React.Fragment>
                {step === "sign" && signTransactionModal(createOptions.HIVE)}
                {step === "success" && successModalBody()}
                {step === "failed" && failedModalBody()}
              </React.Fragment>
            )}

            {createOption === createOptions.CREDIT && (
              <React.Fragment>
                {step === "sign" && signTransactionModal(createOptions.CREDIT)}
                {step === "success" && successModalBody()}
                {step === "failed" && failedModalBody()}
              </React.Fragment>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(Onboard);
