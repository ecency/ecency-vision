import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";

import UserAvatar from "../user-avatar/index";
import { error, success } from "../feedback";
import keyOrHot from "../key-or-hot";
import LinearProgress from "../linear-progress";

import { _t } from "../../i18n";
import _ from "lodash";
import { formatError, Revoke, RevokeHot, RevokeKc } from "../../api/operations";
import { getAccounts } from "../../api/hive";
import * as ls from "../../util/local-storage";
import { PrivateKey } from "@hiveio/dhive";
import { generateKeys } from "../../helper/generate-private-keys";

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  signingKey: string;
  setSigningKey: (key: string) => void;
}

export default function ManageAuthorities(props: Props) {
  const [postingsAuthority, setPostingsAuthority] = useState<Array<any>>([]);
  const [newPostingsAuthority, setNewPostingsAuthority] = useState<Array<any>>([]);
  const [posting, setPostingKey] = useState<Array<any>>([]);
  const [owner, setOwner] = useState<Array<any>>([]);
  const [active, setActiveKey] = useState<Array<any>>([]);
  const [weight, setWeight] = useState(0);
  const [step, setStep] = useState(0);
  const [keyDialog, setKeyDialog] = useState(false);
  const [memokey, setMemoKey] = useState("");
  const [targetAccount, setTargetAccount] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [curPass, setCurPass] = useState("");
  const [publicOwnerKey, setPublicOwnerKey] = useState<any>();
  const [publicActiveKey, setPublicActiveKey] = useState<any>();
  const [publicPostingKey, setPublicPostingKey] = useState<any>();
  const [ownerReveal, setOwnerReveal] = useState(true);
  const [activeReveal, setActiveReveal] = useState(true);
  const [postingReveal, setPostingReveal] = useState(true);
  const [privateOwnerKey, setPrivateOwnerKey] = useState("");
  const [privateActiveKey, setPrivateActiveKey] = useState("");
  const [privatePostingKey, setPrivatePostingKey] = useState("");

  useEffect(() => {
    getAccountData();
    getKeys();
  }, []);

  const getAccountData = async () => {
    const response = await getAccounts([props.activeUser!.username]);
    if (response) {
      const resp = response[0];
      setWeight(resp.active.weight_threshold);
      setPostingsAuthority(resp.posting.account_auths);
      setPostingKey(resp.posting.key_auths[0]);
      setOwner(resp.owner.key_auths[0]);
      setActiveKey(resp.active.key_auths[0]);
      setMemoKey(resp.memo_key);
      setPublicOwnerKey(resp.owner.key_auths[0][0]);
      setPublicActiveKey(resp.active.key_auths[0][0]);
      setPublicPostingKey(resp.posting.key_auths[0][0]);
    }
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
  };

  const getKeys = () => {
    const { activeUser } = props;
    const keys = ls.get(`${activeUser?.username}_private_keys`);
    if (!_.isEmpty(keys)) {
      setPrivateOwnerKey(keys.owner);
      setPrivateActiveKey(keys.active);
      setPrivatePostingKey(keys.posting);
    }
  };

  const handleRevoke = (account: string) => {
    setTargetAccount(account);
    setKeyDialog(true);
    setStep(1);
    setNewPostingsAuthority(postingsAuthority.filter((x) => x[0] !== account));
  };

  const handleOwnerReveal = () => {
    setOwnerReveal(!ownerReveal);
  };

  const handleActiveReveal = () => {
    setActiveReveal(!activeReveal);
  };

  const handlePostingReveal = () => {
    setPostingReveal(!postingReveal);
  };

  const copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(_t("manage-authorities.copied"));
  };

  const onKey = (key: PrivateKey): void => {
    setInProgress(true);
    const promise = Revoke(
      props.activeUser!.username,
      weight,
      newPostingsAuthority,
      [posting],
      memokey,
      "",
      key
    );
    promise
      .then((resp) => {
        if (resp.id) {
          setKeyDialog(true);
          setStep(2);
        }
      })
      .catch((err) => {
        error(...formatError(err));
      })
      .finally(() => {
        setInProgress(false);
      });
  };

  const onHot = () => {
    RevokeHot(props.activeUser!.username, weight, newPostingsAuthority, [posting], memokey, "");
    setKeyDialog(false);
  };

  const onKc = () => {
    RevokeKc(props.activeUser!.username, weight, newPostingsAuthority, [posting], memokey, "");
  };

  const finish = () => {
    setKeyDialog(false);
    getAccountData();
  };

  const handleImportBtn = () => {
    setKeyDialog(true);
    setStep(3);
  };

  const handleSubmit = () => {
    const { activeUser } = props;
    const privateKeys = generateKeys(activeUser!, curPass);
    if (!_.isEmpty(privateKeys)) {
      ls.set(`${activeUser?.username}_private_keys`, privateKeys);
      setStep(4);
      getKeys();
    }
  };

  const passwordModal = () => {
    return (
      <>
        <div className="sign-dialog-header border-bottom">
          <div className="step-no">1</div>
          <div className="sign-dialog-titles">
            <div className="authority-main-title">{_t("manage-authorities.password-title")}</div>
            <div className="authority-sub-title">{_t("manage-authorities.password-sub-title")}</div>
          </div>
        </div>
        {inProgress && <LinearProgress />}
        <div className="curr-password">
          <Form.Group controlId="formPlaintextPassword">
            <Form.Label>{_t("view-keys.cur-pass")}</Form.Label>
            <Form.Control
              value={curPass}
              onChange={(e) => setCurPass(e.target.value)}
              required={true}
              type="password"
              autoFocus={true}
              autoComplete="off"
            />
          </Form.Group>
          <Button onClick={handleSubmit}>{_t("manage-authorities.submit")}</Button>
        </div>
      </>
    );
  };

  const keySuccessModal = () => {
    return (
      <>
        <div className="sign-dialog-header border-bottom">
          <div className="step-no">2</div>
          <div className="sign-dialog-titles">
            <div className="authority-main-title">{_t("trx-common.success-title")}</div>
            <div className="authority-sub-title">{_t("trx-common.success-sub-title")}</div>
          </div>
        </div>
        <div className="success-dialog-body">
          <div className="success-dialog-content">
            <span>{_t("manage-authorities.keys-success-message")} </span>
          </div>
          <div className="d-flex justify-content-center">
            <span className="hr-6px-btn-spacer" />
            <Button onClick={finish}>{_t("g.finish")}</Button>
          </div>
        </div>
      </>
    );
  };

  const signkeyModal = () => {
    return (
      <>
        <div className="sign-dialog-header border-bottom">
          <div className="step-no">1</div>
          <div className="sign-dialog-titles">
            <div className="authority-main-title">{_t("manage-authorities.sign-title")}</div>
            <div className="authority-sub-title">{_t("manage-authorities.sign-sub-title")}</div>
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
            onKey(key);
          },
          onHot: () => {
            toggleKeyDialog();
            if (onHot) {
              onHot();
            }
          },
          onKc: () => {
            toggleKeyDialog();
            if (onKc) {
              onKc();
            }
          }
        })}
        <p className="text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setKeyDialog(false);
            }}
          >
            {_t("g.back")}
          </a>
        </p>
      </>
    );
  };

  const successModal = () => {
    return (
      <>
        <div className="success-dialog-header border-bottom">
          <div className="step-no">2</div>
          <div className="success-dialog-titles">
            <div className="authority-main-title">{_t("trx-common.success-title")}</div>
            <div className="authority-sub-title">{_t("trx-common.success-sub-title")}</div>
          </div>
        </div>

        <div className="success-dialog-body">
          <div className="success-dialog-content">
            <span>
              {" "}
              {_t("manage-authorities.success-message")}{" "}
              <a href={`https://ecency.com/@${targetAccount}`} target="_blank">
                {targetAccount}
              </a>{" "}
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

  const table = () => {
    return (
      <table className="table table-responsive">
        <thead className="table-head">
          <tr>
            <th>{_t("manage-authorities.type")}</th>
            <th>{_t("manage-authorities.key")}</th>
            <th></th>
            <th>{_t("manage-authorities.weight")}</th>
          </tr>
        </thead>
        <tbody>
          {postingsAuthority && postingsAuthority.length > 0 && (
            <>
              {postingsAuthority.map((account, i) => {
                return (
                  <>
                    <tr key={i} className="tabl-row">
                      <td className="col-type-content">{_t("manage-authorities.posting")}</td>
                      {
                        <>
                          <td>
                            <p className="col-key-content">
                              <a
                                className="username"
                                target="_blank"
                                href={`https://ecency.com/@${account[0]}`}
                              >
                                <span className="user-img">
                                  {UserAvatar({
                                    global: props.global,
                                    username: account[0],
                                    size: "small"
                                  })}
                                </span>

                                {account[0]}
                              </a>
                            </p>
                          </td>
                          <td>
                            {" "}
                            <Button
                              onClick={() => handleRevoke(account[0])}
                              variant="outline-primary"
                            >
                              {_t("manage-authorities.revoke")}
                            </Button>
                          </td>
                          <td className="col-weight-content">{account[1]}</td>
                        </>
                      }
                    </tr>
                  </>
                );
              })}
            </>
          )}
          <tr>
            <td className="col-type-content"> {_t("manage-authorities.owner")}</td>
            <td className="key">{ownerReveal ? publicOwnerKey : privateOwnerKey}</td>
            <td>
              <p className="action-btns">
                <Button
                  className="copy-btn"
                  variant="outline-primary"
                  onClick={() =>
                    ownerReveal ? copyToClipboard(publicOwnerKey) : copyToClipboard(privateOwnerKey)
                  }
                >
                  {_t("manage-authorities.copy")}
                </Button>
                {privateOwnerKey ? (
                  <Button
                    className="reveal-btn"
                    variant="outline-primary"
                    onClick={handleOwnerReveal}
                  >
                    {ownerReveal
                      ? _t("manage-authorities.reveal-private-key")
                      : _t("manage-authorities.reveal-public-key")}
                  </Button>
                ) : (
                  <Button
                    className="import-btn"
                    variant="outline-primary"
                    onClick={handleImportBtn}
                  >
                    {_t("manage-authorities.import")}
                  </Button>
                )}
              </p>
            </td>

            <td className="col-weight-content">{owner[1]}</td>
          </tr>
          <tr>
            <td className="col-type-content"> {_t("manage-authorities.active")}</td>
            <td className="key">{activeReveal ? publicActiveKey : privateActiveKey}</td>
            <td className="action-btns">
              <p>
                <Button
                  className="copy-btn"
                  variant="outline-primary"
                  onClick={() => {
                    activeReveal
                      ? copyToClipboard(publicActiveKey)
                      : copyToClipboard(privateActiveKey);
                  }}
                >
                  {_t("manage-authorities.copy")}
                </Button>
                {privateActiveKey ? (
                  <Button
                    className="reveal-btn"
                    variant="outline-primary"
                    onClick={handleActiveReveal}
                  >
                    {activeReveal
                      ? _t("manage-authorities.reveal-private-key")
                      : _t("manage-authorities.reveal-public-key")}
                  </Button>
                ) : (
                  <Button
                    className="import-btn"
                    variant="outline-primary"
                    onClick={handleImportBtn}
                  >
                    {_t("manage-authorities.import")}
                  </Button>
                )}
              </p>
            </td>

            <td className="col-weight-content">{active[1]}</td>
          </tr>
          <tr>
            <td className="col-type-content"> {_t("manage-authorities.posting")}</td>
            <td className="key">{postingReveal ? publicPostingKey : privatePostingKey}</td>
            <td className="action-btns">
              <p>
                <Button
                  className="copy-btn"
                  variant="outline-primary"
                  onClick={() =>
                    postingReveal
                      ? copyToClipboard(publicPostingKey)
                      : copyToClipboard(privatePostingKey)
                  }
                >
                  {_t("manage-authorities.copy")}
                </Button>
                {privatePostingKey ? (
                  <Button
                    className="reveal-btn"
                    variant="outline-primary"
                    onClick={handlePostingReveal}
                  >
                    {postingReveal
                      ? _t("manage-authorities.reveal-private-key")
                      : _t("manage-authorities.reveal-public-key")}
                  </Button>
                ) : (
                  <Button
                    className="import-btn"
                    variant="outline-primary"
                    onClick={handleImportBtn}
                  >
                    {_t("manage-authorities.import")}
                  </Button>
                )}
              </p>
            </td>

            <td className="col-weight-content">{posting[1]}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="container authority-table">
      {publicPostingKey && table()}
      {keyDialog && (
        <Modal
          animation={false}
          show={true}
          centered={true}
          onHide={toggleKeyDialog}
          keyboard={false}
          className="authorities-dialog modal-thin-header"
          size="lg"
        >
          <Modal.Header closeButton={true} />
          <Modal.Body>
            {step === 1 && signkeyModal()}
            {step === 2 && successModal()}
            {step === 3 && passwordModal()}
            {step === 4 && keySuccessModal()}
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}
