import React, { useState, useRef } from "react";
import { useEffect } from "react";
import { Button, Form, FormControl, Modal, Spinner } from "react-bootstrap";

import { ActiveUser } from "../../store/active-user/types";
import { Global } from "../../store/global/types";
import { PrivateKey } from "@hiveio/dhive";

import keyOrHot from "../key-or-hot";
import UserAvatar from "../user-avatar";
import { error } from "../feedback";

import { arrowRightSvg } from "../../img/svg";
import { _t } from "../../i18n";
import { getAccount, findAccountRecoveryRequest } from "../../api/hive";
import { changeRecoveryAccount } from "../../api/operations";

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  signingKey: string;
  setSigningKey: (key: string) => void;
}
export default function AccountRecovery(props: Props) {
  const form = useRef<HTMLFormElement>(null);
  const [keyDialog, setKeyDialog] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [step, setStep] = useState(1);
  const [currRecoveryAccount, setCurrRecoveryAccount] = useState("");
  const [newRecoveryAccount, setNewCurrRecoveryAccount] = useState("");

  useEffect(() => {
    getCurrentAccount();
  }, []);

  useEffect(() => {
    console.log(step);
  }, [step]);

  const getCurrentAccount = async () => {
    const account = await getAccount(props.activeUser!.username);
    const { recovery_account } = account;
    setCurrRecoveryAccount(recovery_account);
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
    setStep(1);
  };

  const currRecoveryAccountChange = (
    e: React.ChangeEvent<typeof FormControl & HTMLInputElement>
  ) => {
    setNewCurrRecoveryAccount(e.target.value);
  };

  const update = async () => {
    console.log("Update run");
    const resp = await findAccountRecoveryRequest(props.activeUser!.username);
    if (resp.requests.length) {
      error(_t("account-recovery.req-error"));
    } else {
      toggleKeyDialog();
      // changeRecoveryAccount(activeUser.username, newRecoveryAccount, []).then((resp) => {
      //   console.log(resp);
      // });
    }
  };
  const onKey = (key: PrivateKey): void => {
    console.log("On key press");
  };

  const onHot = () => {
    console.log("On Hot press");
  };

  const onKc = () => {
    console.log("On KC press");
  };

  const back = () => {
    toggleKeyDialog();
  };

  const confirm = () => {
    setStep(2);
  };

  return (
    <div className="dialog-content">
      <Form
        ref={form}
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          e.stopPropagation();

          if (!form.current?.checkValidity()) {
            return;
          }
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
            onChange={currRecoveryAccountChange}
            required={true}
            type="text"
            autoFocus={true}
            autoComplete="off"
          />
        </Form.Group>
        <Form.Group controlId="re-new-pass">
          <Form.Label>{_t("account-recovery.extensions")}</Form.Label>
          <Form.Control
            // value={newPass2}
            // onChange={this.newPass2Changed}
            type="text"
            autoComplete="off"
            // onInvalid={(e: any) => handleInvalid(e, "password-update.", "validation-password")}
            // onInput={handleOnInput}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          {_t("g.update")}
        </Button>
      </Form>

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
                  <div className="recover-box-titles">
                    <div className="recovery-main-title">
                      {_t("account-recovery.confirm-title")}
                    </div>
                    <div className=" recovery-sub-title">
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
                    <Button variant="outline-secondary" disabled={inProgress} onClick={back}>
                      {_t("g.back")}
                    </Button>
                    <span className="hr-6px-btn-spacer" />
                    <Button disabled={inProgress} onClick={confirm}>
                      {_t("transfer.confirm")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
}
