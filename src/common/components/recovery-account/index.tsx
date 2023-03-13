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
import LinearProgress from "../linear-progress";

import { arrowRightSvg } from "../../img/svg";
import { _t } from "../../i18n";
import { getAccount, findAccountRecoveryRequest } from "../../api/hive";
import {
  changeRecoveryAccount,
  formatError,
  changeRecoveryAccountHot,
  changeRecoveryAccountKc
} from "../../api/operations";

import "./index.scss";

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
  const [pendingRecoveryAccount, setPendingRecoveryAccount] = useState("");

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
      setPendingRecoveryAccount(resp.requests[0].recovery_account);
      setPopOver(true);
    }
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
  };

  const newRecoveryAccountChange = async (
    e: React.ChangeEvent<typeof FormControl & HTMLInputElement>
  ) => {
    e.persist();
    setNewCurrRecoveryAccount(e.target.value);

    if (e.target.value.length == 0) {
      setDisabled(true);
      setToError("");
      return;
    } else {
      const resp = await getAccount(e.target.value);
      if (resp) {
        setDisabled(false);
        setToError("");
      } else {
        if (e.target.value.length > 0) {
          setDisabled(true);
          setToError(_t("account-recovery.to-not-found"));
        }
      }
    }
  };

  const update = () => {
    if (!popOver) {
      setKeyDialog(true);
    }
  };

  const onKey = async (key: PrivateKey) => {
    try {
      setInProgress(true);
      let result = await changeRecoveryAccount(
        props.activeUser!.username,
        newRecoveryAccount,
        [],
        key
      );
      if (result.id) {
        setKeyDialog(true);
        setStep(3);
      }
    } catch (err) {
      error(...formatError(err));
    } finally {
      setInProgress(false);
    }
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

  const confirmationModal = () => {
    return (
      <div className="recovery-confirm-dialog">
        <div className="recovery-confirm-dialog-content">
          <div className="recovery-confirm-dialog-header">
            <div className="step-no">1</div>
            <div className="recovery-confirm-box-titles">
              <div className="recovery-main-title">{_t("account-recovery.confirm-title")}</div>
              <div className="recovery-sub-title">{_t("account-recovery.confirm-sub-title")}</div>
            </div>
          </div>
          <div className="recovery-confirm-dialog-body">
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
    );
  };

  const signkeyModal = () => {
    return (
      <>
        <div className="recovery-sign-dialog-header border-bottom">
          <div className="step-no">2</div>
          <div className="recovery-sign-dialog-titles">
            <div className="recovery-main-title">{_t("account-recovery.sign-title")}</div>
            <div className="recovery-sub-title">{_t("account-recovery.sign-sub-title")}</div>
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
              setStep(1);
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
        <div className="recovery-success-dialog-header border-bottom">
          <div className="step-no">3</div>
          <div className="recovery-success-dialog-titles">
            <div className="recovery-main-title">{_t("trx-common.success-title")}</div>
            <div className="recovery-sub-title">{_t("trx-common.success-sub-title")}</div>
          </div>
        </div>

        <div className="recovery-success-dialog-body">
          <div className="recovery-success-dialog-content">
            <span> {_t("account-recovery.success-message")}</span>
          </div>
          <div className="d-flex justify-content-center">
            <span className="hr-6px-btn-spacer" />
            <Button onClick={finish}>{_t("g.finish")}</Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="account-recovery-form">
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
              placement="top"
              trigger="click"
              onConfirm={() => handleConfirm()}
              titleText={_t("account-recovery.info-message", { n: pendingRecoveryAccount })}
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
            {step === 1 && confirmationModal()}
            {step === 2 && signkeyModal()}
            {step === 3 && successModal()}
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}
