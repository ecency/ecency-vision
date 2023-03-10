import React, { useEffect, useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";

import * as ls from "../../util/local-storage";
import { cryptoUtils, PrivateKey, PublicKey } from "@hiveio/dhive";
import { decodeObj, encodeObj } from "../../util/encoder";

import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";
import { User, UserKeys } from "../../store/users/types";

import { Keytype, AccountDataType } from "./types";

import UserAvatar from "../user-avatar/index";
import { error, success } from "../feedback";
import keyOrHot from "../key-or-hot";
import LinearProgress from "../linear-progress";

import { formatError, Revoke, RevokeHot, RevokeKc } from "../../api/operations";
import { getAccounts } from "../../api/hive";
import { generateKeys } from "../../helper/generate-private-keys";

import { _t } from "../../i18n";
import _ from "lodash";
import "./index.scss";

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  signingKey: string;
  setSigningKey: (key: string) => void;
}

export default function ManageAuthorities(props: Props) {
  const [accountData, setAccountdata] = useState<AccountDataType>();
  const [newPostingsAuthority, setNewPostingsAuthority] = useState<Array<any>>([]);
  const [step, setStep] = useState(0);
  const [keyDialog, setKeyDialog] = useState(false);
  const [targetAccount, setTargetAccount] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [key, setKey] = useState("");
  const [ownerReveal, setOwnerReveal] = useState(true);
  const [activeReveal, setActiveReveal] = useState(true);
  const [postingReveal, setPostingReveal] = useState(true);
  const [privateKeys, setPrivatekeys] = useState<UserKeys>({});
  const [keyType, setKeyType] = useState("");

  useEffect(() => {
    getAccountData();
    getKeys();
  }, []);

  const getAccountData = async () => {
    const response = await getAccounts([props.activeUser!.username]);
    if (response) {
      const resp = response[0];
      setAccountdata({
        postingsAuthority: resp.posting.account_auths,
        posting: resp.posting.key_auths[0],
        owner: resp.owner.key_auths[0],
        active: resp.active.key_auths[0],
        weight: resp.active.weight_threshold,
        memokey: resp.memo_key,
        account: response[0],
        publicOwnerKey: resp.owner.key_auths[0][0],
        publicActiveKey: resp.active.key_auths[0][0],
        publicPostingKey: resp.posting.key_auths[0][0]
      });
    }
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
  };

  const getKeys = () => {
    const { activeUser } = props;
    const currentUser = ls
      .getByPrefix("user_")
      .map((x) => {
        const u = decodeObj(x) as User;
        return {
          username: u.username,
          privateKeys: u.privateKeys!
        };
      })
      .filter((x) => x.username === activeUser?.username);
    if (currentUser) {
      setPrivatekeys(currentUser[0].privateKeys);
    }
  };

  const handleRevoke = (account: string) => {
    setTargetAccount(account);
    setKeyDialog(true);
    setStep(1);
    setNewPostingsAuthority(accountData!.postingsAuthority.filter((x) => x[0] !== account));
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

  const onKey = async (key: PrivateKey) => {
    try {
      setInProgress(true);
      const resp = await Revoke(
        props.activeUser!.username,
        accountData!.weight,
        newPostingsAuthority,
        [accountData!.posting],
        accountData!.memokey,
        "",
        key
      );
      if (resp.id) {
        setKeyDialog(true);
        setStep(2);
      }
    } catch (err) {
      error(...formatError(err));
    } finally {
      setInProgress(false);
    }
  };

  const onHot = () => {
    RevokeHot(
      props.activeUser!.username,
      accountData!.weight,
      newPostingsAuthority,
      [accountData!.posting],
      accountData!.memokey,
      ""
    );
    setKeyDialog(false);
  };

  const onKc = () => {
    RevokeKc(
      props.activeUser!.username,
      accountData!.weight,
      newPostingsAuthority,
      [accountData!.posting],
      accountData!.memokey,
      ""
    );
  };

  const finish = () => {
    setKeyDialog(false);
    getAccountData();
  };

  const handleImportBtn = (type: string) => {
    setKeyType(type);
    setKeyDialog(true);
    setStep(3);
  };

  const updateUser = (activeUser: ActiveUser, updatedUser: User) => {
    ls.set(`user_${activeUser!.username}`, encodeObj(updatedUser));
  };

  const handleSubmit = () => {
    const { activeUser } = props;
    //decode user object.
    const currentUser = ls
      .getByPrefix("user_")
      .map((x) => {
        const u = decodeObj(x) as User;
        return u;
      })
      .filter((x) => x.username === props.activeUser?.username);

    if (!key.length) {
      error(_t("manage-authorities.error-fields-required"));
      return;
    }

    try {
      PublicKey.fromString(key);
      error(_t("login.error-public-key"));
      return;
    } catch (e) {}

    const isPlainPassword = !cryptoUtils.isWif(key);

    let thePrivateKey!: PrivateKey;
    var keys: UserKeys = {};

    if (isPlainPassword) {
      thePrivateKey = PrivateKey.fromLogin(accountData!.account.name, key, "active");
      keys = generateKeys(activeUser!, key);
      const activePublicInput = thePrivateKey.createPublic().toString();
      if (!accountData!.publicActiveKey.includes(activePublicInput)) {
        error(_t("login.error-authenticate")); // enter master or active key
        return;
      }
    } else {
      if (
        accountData!.publicOwnerKey.includes(PrivateKey.fromString(key).createPublic().toString())
      ) {
        thePrivateKey = PrivateKey.fromString(key);
        const ownerKey = thePrivateKey.toString();
        if (ownerKey === key && keyType === Keytype.Owner) {
          keys = { owner: ownerKey };
        } else {
          error(_t("manage-authorities.error-wrong-key"));
          return;
        }
      } else if (
        accountData!.publicPostingKey.includes(PrivateKey.fromString(key).createPublic().toString())
      ) {
        thePrivateKey = PrivateKey.fromString(key);
        const postingKey = thePrivateKey.toString();
        if (postingKey === key && keyType === Keytype.Posting) {
          keys = { posting: postingKey };
        } else {
          error(_t("manage-authorities.error-wrong-key"));
          return;
        }
      } else {
        if (
          accountData!.publicActiveKey.includes(
            PrivateKey.fromString(key).createPublic().toString()
          )
        ) {
          thePrivateKey = PrivateKey.fromString(key);
          const activeKey = thePrivateKey.toString();
          if (activeKey === key && keyType === Keytype.Active) {
            keys = { active: activeKey };
          } else {
            error(_t("manage-authorities.error-wrong-key"));
            return;
          }
        } else {
          error(_t("manage-authorities.error-wrong-key"));
          return;
        }
      }
    }

    const pKeys = currentUser[0].privateKeys;
    const updatedUser: User = {
      ...currentUser[0],
      ...{ ...{ privateKeys: { ...pKeys, ...keys } } }
    };
    updateUser(activeUser!, updatedUser);
    setStep(4);
    getKeys();
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
            <Form.Label>{_t("manage-authorities.password-label")}</Form.Label>
            <Form.Control
              value={key}
              placeholder="Enter Master pasword/private key"
              onChange={(e) => setKey(e.target.value)}
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
          {accountData!.postingsAuthority && accountData!.postingsAuthority.length > 0 && (
            <>
              {accountData!.postingsAuthority.map((account, i) => {
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
            <td className="key">
              {ownerReveal ? accountData!.publicOwnerKey : privateKeys?.owner!}
            </td>
            <td>
              <p className="action-btns">
                <Button
                  className="copy-btn"
                  variant="outline-primary"
                  onClick={() =>
                    ownerReveal
                      ? copyToClipboard(accountData!.publicOwnerKey)
                      : copyToClipboard(privateKeys?.owner!)
                  }
                >
                  {_t("manage-authorities.copy")}
                </Button>
                {privateKeys?.owner! ? (
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
                    onClick={() => handleImportBtn(Keytype.Owner)}
                  >
                    {_t("manage-authorities.import")}
                  </Button>
                )}
              </p>
            </td>

            <td className="col-weight-content">{accountData!.owner[1]}</td>
          </tr>
          <tr>
            <td className="col-type-content"> {_t("manage-authorities.active")}</td>
            <td className="key">
              {activeReveal ? accountData!.publicActiveKey : privateKeys?.active!}
            </td>
            <td className="action-btns">
              <p>
                <Button
                  className="copy-btn"
                  variant="outline-primary"
                  onClick={() => {
                    activeReveal
                      ? copyToClipboard(accountData!.publicActiveKey)
                      : copyToClipboard(privateKeys?.active!);
                  }}
                >
                  {_t("manage-authorities.copy")}
                </Button>
                {privateKeys?.active! ? (
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
                    onClick={() => handleImportBtn(Keytype.Active)}
                  >
                    {_t("manage-authorities.import")}
                  </Button>
                )}
              </p>
            </td>

            <td className="col-weight-content">{accountData!.active[1]}</td>
          </tr>
          <tr>
            <td className="col-type-content"> {_t("manage-authorities.posting")}</td>
            <td className="key">
              {postingReveal ? accountData!.publicPostingKey : privateKeys?.posting!}
            </td>
            <td className="action-btns">
              <p>
                <Button
                  className="copy-btn"
                  variant="outline-primary"
                  onClick={() =>
                    postingReveal
                      ? copyToClipboard(accountData!.publicPostingKey)
                      : copyToClipboard(privateKeys?.posting!)
                  }
                >
                  {_t("manage-authorities.copy")}
                </Button>
                {privateKeys?.posting! ? (
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
                    onClick={() => handleImportBtn(Keytype.Posting)}
                  >
                    {_t("manage-authorities.import")}
                  </Button>
                )}
              </p>
            </td>

            <td className="col-weight-content">{accountData!.posting[1]}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="container authority-table">
      {accountData && table()}
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
