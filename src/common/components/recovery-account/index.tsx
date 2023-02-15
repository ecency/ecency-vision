import React, { useState } from "react";
import { useEffect } from "react";
import { Button, Form, FormControl, Modal } from "react-bootstrap";

import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";
import { PrivateKey } from "@hiveio/dhive";

import keyOrHot from "../key-or-hot";
import UserAvatar from "../user-avatar";
import { error } from "../feedback";
import PopoverConfirm from "../popover-confirm";

import { arrowRightSvg } from "../../img/svg";
import { _t } from "../../i18n";
import { getAccount, findAccountRecoveryRequest } from "../../api/hive";
import {
  changeRecoveryAccount,
  formatError,
  changeRecoveryAccountHot,
  changeRecoveryAccountKc
} from "../../api/operations";

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  signingKey: string;
  setSigningKey: (key: string) => void;
}
export default function AccountRecovery(props: Props) {
  const [keyDialog, setKeyDialog] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [popOver, setPopOver] = useState(false);
  const [step, setStep] = useState(1);
  const [toError, setToError] = useState("");
  const [currRecoveryAccount, setCurrRecoveryAccount] = useState("");
  const [newRecoveryAccount, setNewCurrRecoveryAccount] = useState("");

  useEffect(() => {
    getCurrentAccount();
    getRecoveryRequest();
  }, []);

  const getCurrentAccount = async () => {
    const account = await getAccount(props.activeUser!.username);
    const { recovery_account } = account;
    setCurrRecoveryAccount(recovery_account);
  };

  const getRecoveryRequest = async () => {
    const resp = await findAccountRecoveryRequest(props.activeUser!.username);
    if (resp.requests.length) {
      setPopOver(true);
    }
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
  };

  const newRecoveryAccountChange = async (
    e: React.ChangeEvent<typeof FormControl & HTMLInputElement>
  ) => {
    setNewCurrRecoveryAccount(e.target.value);
    if (!e.target.value) {
      setDisabled(true);
      setToError("");
      return;
    } else {
      const resp = await getAccount(e.target.value);
      if (resp) {
        setDisabled(false);
        setToError("");
      } else {
        setDisabled(true);
        setToError(_t("account-recovery.to-not-found"));
      }
    }
  };

  const update = () => {
    if (!popOver) {
      setKeyDialog(true);
    }
  };

  const onKey = (key: PrivateKey): void => {
    let promise: Promise<any> = changeRecoveryAccount(
      props.activeUser!.username,
      newRecoveryAccount,
      [],
      key
    );
    promise
      .then((resp) => {
        if (resp.id) {
          setKeyDialog(true);
          setStep(3);
        }
      })
      .catch((err) => {
        error(...formatError(err));
      });
  };

  const onHot = () => {
    changeRecoveryAccountHot(props.activeUser!.username, newRecoveryAccount, []);
    setKeyDialog(false);
  };

  const onKc = () => {
    changeRecoveryAccountKc(props.activeUser!.username, newRecoveryAccount, []);
  };

  const back = () => {
    toggleKeyDialog();
  };

  const confirm = () => {
    setStep(2);
  };

  const finish = () => {
    setKeyDialog(false);
    setNewCurrRecoveryAccount("");
  };

  const handleConfirm = () => {
    setKeyDialog(true);
    setStep(1);
  };

  return (
    <div className="dialog-content">
      <Form
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          e.stopPropagation();
          update();
        }}
      >
        <Form.Group controlId="account-name">
          <Form.Label>{_t("account-recovery.curr-recovery-acc")}</Form.Label>
          <Form.Control type="text" readOnly={true} value={currRecoveryAccount} />
        </Form.Group>
        <Form.Group controlId="cur-pass">
          <Form.Label>{_t("account-recovery.new-recovery-acc")}</Form.Label>
          <Form.Control
            value={newRecoveryAccount}
            onChange={newRecoveryAccountChange}
            required={true}
            type="text"
            autoFocus={true}
            autoComplete="off"
            className={toError ? "is-invalid" : ""}
          />
        </Form.Group>
        {toError && <small className="error-info">{toError}</small>}

        {popOver ? (
          <div className="main">
            <PopoverConfirm
              placement="left"
              trigger="click"
              onConfirm={() => handleConfirm()}
              titleText={_t("account-recovery.info-message")}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Button disabled={disabled} variant="primary" type="submit">
                  {_t("g.update")}
                </Button>
              </div>
            </PopoverConfirm>
          </div>
        ) : (
          <Button disabled={disabled} variant="primary" type="submit">
            {_t("g.update")}
          </Button>
        )}
      </Form>

      {keyDialog && step === 1 && (
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
            <div className="recovery-dialog-content">
              <div className="recovery-change-form">
                <div className="recovery-change-form-header">
                  <div className="step-no">1</div>
                  <div className="recovery-box-titles">
                    <div className="recovery-main-title">
                      {_t("account-recovery.confirm-title")}
                    </div>
                    <div className="recovery-sub-title">
                      {_t("account-recovery.confirm-sub-title")}
                    </div>
                  </div>
                </div>
                <div className="recovery-change-form-body">
                  <div className="confirmation">
                    <div className="users">
                      <div className="from-user">
                        {UserAvatar({
                          ...props,
                          username: props.activeUser!.username,
                          size: "large"
                        })}
                      </div>

                      <>
                        <div className="arrow">{arrowRightSvg}</div>
                        <div className="to-user">
                          {UserAvatar({ ...props, username: newRecoveryAccount, size: "large" })}
                        </div>
                      </>
                    </div>
                  </div>
                  <div className="d-flex justify-content-center">
                    <Button variant="outline-secondary" onClick={back}>
                      {_t("g.back")}
                    </Button>
                    <span className="hr-6px-btn-spacer" />
                    <Button onClick={confirm}>{_t("transfer.confirm")}</Button>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}

      {keyDialog && step === 2 && (
        <Modal
          animation={false}
          show={true}
          centered={true}
          onHide={toggleKeyDialog}
          keyboard={false}
          className="key-or-hot-modal modal-thin-header"
        >
          <Modal.Header closeButton={true} />
          <Modal.Body>
            <div className="sign-form-header">
              <div className="step-no">2</div>
              <div className="recovery-box-titles">
                <div className="recovery-main-title">{_t("account-recovery.sign-title")}</div>
                <div className="recovery-sub-title">{_t("account-recovery.sign-sub-title")}</div>
              </div>
            </div>
            {keyOrHot({
              global: props.global,
              activeUser: props.activeUser,
              signingKey: props.signingKey,
              setSigningKey: props.setSigningKey,
              inProgress: false,
              onKey: (key) => {
                toggleKeyDialog();
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
          </Modal.Body>
        </Modal>
      )}

      {keyDialog && step === 3 && (
        <Modal
          animation={false}
          show={true}
          centered={true}
          onHide={toggleKeyDialog}
          keyboard={false}
          className="trx-success-modal modal-thin-header"
          size="lg"
        >
          <Modal.Header closeButton={true} />
          <Modal.Body>
            <div className="recovery-success-header border-bottom">
              <div className="step-no">3</div>
              <div className="recover-success-titles">
                <div className="recovery-main-title">{_t("trx-common.success-title")}</div>
                <div className="recovery-sub-title">{_t("trx-common.success-sub-title")}</div>
              </div>
            </div>

            <div className="recovery-success-body">
              <div className="recovery-success-content">
                <span> {_t("account-recovery.success-message")}</span>
              </div>
              <div className="d-flex justify-content-center">
                <span className="hr-6px-btn-spacer" />
                <Button onClick={finish}>{_t("g.finish")}</Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}
