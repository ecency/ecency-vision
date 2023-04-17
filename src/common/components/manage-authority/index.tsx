import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { History } from "history";

import { PrivateKey } from "@hiveio/dhive";

import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";
import { AccountDataType, actionType } from "./types";

import UserAvatar from "../user-avatar/index";
import { error } from "../feedback";
import keyOrHot from "../key-or-hot";
import LinearProgress from "../linear-progress";
import ManageAuthIcon from "../manage-auth-icon";
import ManageKeys from "../manage-keys";

import { formatError, Revoke, RevokeHot, RevokeKc } from "../../api/operations";
import { getAccounts } from "../../api/hive";

import { _t } from "../../i18n";
import "./index.scss";

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  signingKey: string;
  setSigningKey: (key: string) => void;
  history: History;
}

export default function ManageAuthorities(props: Props) {
  const [accountData, setAccountdata] = useState<AccountDataType>();
  const [newPostingsAuthority, setNewPostingsAuthority] = useState<[string, number][]>([]);
  const [step, setStep] = useState(0);
  const [keyDialog, setKeyDialog] = useState(false);
  const [targetAccount, setTargetAccount] = useState("");
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    getAccountData();
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
        publicKeys: {
          publicOwnerKey: resp.owner.key_auths[0][0],
          publicActiveKey: resp.active.key_auths[0][0],
          publicPostingKey: resp.posting.key_auths[0][0],
          publicMemoKey: resp.memo_key
        }
      });
    }
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
  };

  const handleRevoke = (account: string) => {
    setTargetAccount(account);
    setKeyDialog(true);
    setStep(1);
    setNewPostingsAuthority(accountData!.postingsAuthority.filter((x) => x[0] !== account));
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
      accountData!.memokey
    );
    setKeyDialog(false);
  };

  const onKc = () => {
    RevokeKc(
      props.activeUser!.username,
      accountData!.weight,
      newPostingsAuthority,
      [accountData!.posting],
      accountData!.memokey
    );
  };

  const finish = () => {
    setKeyDialog(false);
    getAccountData();
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
      <table className="table">
        <thead>
          <tr>
            <th>{_t("manage-authorities.type")}</th>
            <th>{_t("manage-authorities.key")}</th>
            <th className="d-none d-sm-block border-bottom-0" />
            <th className="d-sm-none col-action">{_t("manage-authorities.actions")}</th>
            <th className="col-weight-content">{_t("manage-authorities.weight")}</th>
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
                                  <UserAvatar username={account[0]} size="small" />
                                </span>

                                {account[0]}
                              </a>
                            </p>
                          </td>
                          <td className="d-none d-sm-block">
                            {" "}
                            <Button
                              onClick={() => handleRevoke(account[0])}
                              variant="outline-primary"
                            >
                              {_t("manage-authorities.revoke")}
                            </Button>
                          </td>
                          <td className="d-sm-none">
                            {
                              <ManageAuthIcon
                                history={props.history}
                                type={actionType.Revoke}
                                account={account[0]}
                                onRevoke={(account) => {
                                  handleRevoke(account);
                                }}
                              />
                            }
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

          <ManageKeys
            history={props.history}
            accountData={accountData!}
            activeUser={props.activeUser!}
          />
        </tbody>
      </table>
    );
  };

  return (
    <>
      <div className="authority-table">{accountData && table()}</div>

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
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}
