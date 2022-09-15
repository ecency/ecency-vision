import { WalletSpkGroup } from "../wallet-spk-group";
import { Button, Form, InputGroup } from "react-bootstrap";
import { _t } from "../../../i18n";
import React from "react";
import { ActiveUser } from "../../../store/active-user/types";

interface Props {
  activeUser: ActiveUser | null;
  submit: Function;
}

export const SendSpkDialogClaimForm = ({ activeUser, submit }: Props) => {
  return (
    <>
      <WalletSpkGroup label="wallet.spk.send.from">
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>@</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            type="text"
            autoFocus={true}
            placeholder=""
            value={activeUser!.username}
            onChange={() => {}}
          />
        </InputGroup>
      </WalletSpkGroup>
      <WalletSpkGroup label="">
        <Button variant={"primary"} onClick={() => submit()}>
          {_t("wallet.spk.send.next")}
        </Button>
      </WalletSpkGroup>
    </>
  );
};
