import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";

import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";

import { Revoke } from "../../api/hive";
import { getAccounts } from "../../api/hive";
import { _t } from "../../i18n";
import UserAvatar from "../user-avatar/index";
import { success } from "../feedback";
import keyOrHot from "../key-or-hot";
import LinearProgress from "../linear-progress";
import { Operation, PrivateKey } from "@hiveio/dhive";

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  signingKey: string;
  setSigningKey: (key: string) => void;
}

export default function ManageAuthorities(props: Props) {
  const [postingsAuthority, setPostingsAuthority] = useState<Array<any>>([]);
  const [posting, setPostingKey] = useState<Array<any>>([]);
  const [owner, setOwner] = useState<Array<any>>([]);
  const [active, setActiveKey] = useState<Array<any>>([]);
  const [weight, setWeight] = useState(0);
  const [step, setStep] = useState(0);
  const [keyDialog, setKeyDialog] = useState(false);
  const [targetAccount, setTargetAccount] = useState("");
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    getAccountData();
  }, []);

  const getAccountData = async () => {
    const resp = await getAccounts([props.activeUser!.username]);
    if (resp) {
      setWeight(resp[0].active.weight_threshold);
      setPostingsAuthority(resp[0].posting.account_auths);
      setPostingKey([resp[0].memo_key, resp[0].active.weight_threshold]);
      setOwner(resp[0].owner.key_auths[0]);
      setActiveKey(resp[0].active.key_auths[0]);
    }
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
  };

  const handleRevoke = (account: string) => {
    setTargetAccount(account);
    setKeyDialog(true);
    setStep(1);
    console.log(active);
    console.log("revoke clicked", account);
    console.log(postingsAuthority);
    const newAccountAuths = postingsAuthority.filter((x) => x[0] !== account);
    console.log(newAccountAuths);
    const newPosting = {
      weight_threshold: weight,
      account_auths: newAccountAuths,
      key_auths: active
    };
    console.log(newPosting);
    const op: Operation = [
      "account_update",
      {
        account,
        posting: newPosting,
        memo_key: posting[0],
        json_metadata: ""
      }
    ];
    // const promoise = Revoke(
    //   props.activeUser!.username,
    //   weight,
    //   newAccountAuths,
    //   active,
    //   posting[0],
    //   ""
    // );
    // promoise.then((resp) => {
    //   console.log(resp);
    // });
    const promise = Revoke(op);
  };

  const copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(_t("view-keys.copied"));
  };

  const onKey = (key: PrivateKey): void => {
    setStep(2);
  };

  const onHot = () => {
    setKeyDialog(false);
  };

  const onKc = () => {};

  const finish = () => {
    setKeyDialog(false);
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
          inProgress: false,
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
          {postingsAuthority && postingsAuthority.length > 0 ? (
            <>
              {postingsAuthority.map((account, i) => {
                return (
                  <>
                    <tr className="tabl-row" key={account}>
                      <td key={account[0]} className="type-data">
                        {_t("manage-authorities.posting")}
                      </td>
                      {
                        <>
                          <td key={i} style={{ display: "flex" }}>
                            {UserAvatar({
                              global: props.global,
                              username: account[0],
                              size: "small"
                            })}
                            <a
                              style={{ marginTop: "2px", marginLeft: "6px" }}
                              target="_blank"
                              href={`https://ecency.com/@${account[0]}`}
                            >
                              {account[0]}
                            </a>
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
                          <td>{account[1]}</td>
                        </>
                      }
                    </tr>
                  </>
                );
              })}
            </>
          ) : (
            <></>
          )}
          <tr>
            <td> {_t("manage-authorities.owner")}</td>
            <td>{owner[0]}</td>
            <td>
              <Button
                className="copy-btn"
                variant="outline-primary"
                onClick={() => copyToClipboard(owner[0])}
              >
                {_t("manage-authorities.copy")}
              </Button>
              <Button variant="outline-primary">{_t("manage-authorities.import")}</Button>
            </td>
            <td>{owner[1]}</td>
          </tr>
          <tr>
            <td> {_t("manage-authorities.active")}</td>
            <td>{active[0]}</td>
            <td>
              <Button
                className="copy-btn"
                variant="outline-primary"
                onClick={() => copyToClipboard(active[0])}
              >
                {_t("manage-authorities.copy")}
              </Button>
              <Button variant="outline-primary">{_t("manage-authorities.import")}</Button>
            </td>

            <td>{active[1]}</td>
          </tr>
          <tr>
            <td> {_t("manage-authorities.posting-text")}</td>
            <td>{posting[0]}</td>
            <td>
              <Button
                className="copy-btn"
                variant="outline-primary"
                onClick={() => copyToClipboard(posting[0])}
              >
                {_t("manage-authorities.copy")}
              </Button>
              <Button variant="outline-primary">{_t("manage-authorities.import")}</Button>
            </td>
            <td>{posting[1]}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div className="container authority-table">
      {table()}
      {keyDialog && (
        <Modal
          animation={false}
          show={true}
          centered={true}
          onHide={toggleKeyDialog}
          keyboard={false}
          className="recovery-dialog modal-thin-header"
          size="lg"
        >
          <Modal.Header closeButton={true} />
          <Modal.Body>
            {step === 1 && signkeyModal()}
            {step === 2 && successModal()}
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}
