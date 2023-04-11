import React from "react";

import { Button, Form, FormControl, InputGroup } from "react-bootstrap";
import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import { success } from "../feedback";
import { generateKeys } from "../../helper/generate-private-keys";
import { _t } from "../../i18n";

import { copyContent } from "../../img/svg";
import truncate from "../../util/truncate";
import "./_index.scss";

interface Props {
  activeUser: ActiveUser;
  onUpdate?: () => void;
}

interface State {
  curPass: string;
  keys: any;
  inProgress: boolean;
}

export default class ViewKeys extends BaseComponent<Props, State> {
  state: State = {
    curPass: "",
    keys: {},
    inProgress: false
  };

  form = React.createRef<HTMLFormElement>();

  curPassChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    this.stateSet({ curPass: e.target.value });
  };

  getKeys = () => {
    const { activeUser } = this.props;
    const { curPass } = this.state;
    const privateKeys = generateKeys(activeUser, curPass);
    this.setState({ keys: privateKeys });
  };

  copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(_t("view-keys.copied"));
  };

  render() {
    const { activeUser } = this.props;
    const { curPass, keys } = this.state;

    return (
      <div className="dialog-content">
        <Form
          ref={this.form}
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.form.current?.checkValidity()) {
              return;
            }

            this.getKeys();
          }}
        >
          <Form.Group controlId="account-name">
            <Form.Label>{_t("view-keys.account")}</Form.Label>
            <Form.Control type="text" readOnly={true} value={activeUser.username} />
          </Form.Group>
          <Form.Group controlId="cur-pass">
            <Form.Label>{_t("view-keys.cur-pass")}</Form.Label>
            <Form.Control
              value={curPass}
              onChange={this.curPassChanged}
              required={true}
              type="password"
              autoFocus={true}
              autoComplete="off"
            />
          </Form.Group>
          <Form.Group controlId="keys-view">
            <div>
              {!keys.memo && (
                <Button variant="outline-primary" onClick={this.getKeys}>
                  {_t("view-keys.view-keys")}
                </Button>
              )}
              {keys.memo && (
                <div>
                  <Form.Group>
                    <Form.Label>{_t("view-keys.owner")}</Form.Label>
                    <InputGroup onClick={() => this.copyToClipboard(keys.owner)}>
                      <Form.Control
                        value={truncate(keys.owner, 30)}
                        disabled={true}
                        className="text-primary pointer"
                      />
                      <InputGroup.Append>
                        <Button
                          variant="primary"
                          size="sm"
                          className="copy-to-clipboard"
                          onClick={() => this.copyToClipboard(keys.owner)}
                        >
                          {copyContent}
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>{_t("view-keys.active")}</Form.Label>
                    <InputGroup onClick={() => this.copyToClipboard(keys.active)}>
                      <Form.Control
                        value={truncate(keys.active, 30)}
                        disabled={true}
                        className="text-primary pointer"
                      />
                      <InputGroup.Append>
                        <Button
                          variant="primary"
                          size="sm"
                          className="copy-to-clipboard"
                          onClick={() => this.copyToClipboard(keys.active)}
                        >
                          {copyContent}
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>{_t("view-keys.posting")}</Form.Label>
                    <InputGroup onClick={() => this.copyToClipboard(keys.posting)}>
                      <Form.Control
                        value={truncate(keys.posting, 30)}
                        disabled={true}
                        className="text-primary pointer"
                      />
                      <InputGroup.Append>
                        <Button
                          variant="primary"
                          size="sm"
                          className="copy-to-clipboard"
                          onClick={() => this.copyToClipboard(keys.posting)}
                        >
                          {copyContent}
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>{_t("view-keys.memo")}</Form.Label>
                    <InputGroup onClick={() => this.copyToClipboard(keys.memo)}>
                      <Form.Control
                        value={truncate(keys.memo, 30)}
                        disabled={true}
                        className="text-primary pointer"
                      />
                      <InputGroup.Append>
                        <Button
                          variant="primary"
                          size="sm"
                          className="copy-to-clipboard"
                          onClick={() => this.copyToClipboard(keys.memo)}
                        >
                          {copyContent}
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                  </Form.Group>
                </div>
              )}
            </div>
          </Form.Group>
        </Form>
      </div>
    );
  }
}
