import React, { useState } from "react";
import { useEffect } from "react";
import { Button, Form, FormControl, Modal, Spinner } from "react-bootstrap";

import { ActiveUser } from "../../store/active-user/types";

import { _t } from "../../i18n";
import { getAccount, findAccountRecoveryRequest } from "../../api/hive";

import { changeRecoveryAccount } from "../../api/operations";

interface Props {
  activeUser: ActiveUser;
}
export default function AccountRecovery({ activeUser }: Props) {
  const [currRecoveryAccount, setCurrRecoveryAccount] = useState("");
  const [newRecoveryAccount, setNewCurrRecoveryAccount] = useState("");

  useEffect(() => {
    getCurrentAccount();
  }, []);

  const getCurrentAccount = async () => {
    const account = await getAccount(activeUser?.username);
    const { recovery_account } = account;
    setCurrRecoveryAccount(recovery_account);
  };

  const update = () => {
    console.log("Update run");
    findAccountRecoveryRequest(activeUser.username).then((resp) => {
      console.log(resp);
      if (resp.requests.length) {
        // changeRecoveryAccount(activeUser.username,)
      } else {
        changeRecoveryAccount(activeUser.username, newRecoveryAccount, []).then((resp) => {
          console.log(resp);
        });
      }
    });
  };
  // form = React.createRef<HTMLFormElement>();
  return (
    <div className="dialog-content">
      <Form
        // ref={this.form}
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          e.stopPropagation();

          // if (!this.form.current?.checkValidity()) {
          //   return;
          // }

          // if (newPass !== newPass2) {
          //   error(_t("password-update.error-new2"));
          //   return;
          // }

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
            onChange={(e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) =>
              setNewCurrRecoveryAccount(e.target.value)
            }
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
        <Button
          variant="primary"
          type="submit"
          //  disabled={inProgress}
        >
          {/* {inProgress && (
            <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
          )} */}
          {_t("g.update")}
        </Button>
      </Form>
    </div>
  );
}
