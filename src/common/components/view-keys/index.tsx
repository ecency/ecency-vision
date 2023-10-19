import React from "react";
import { ActiveUser } from "../../store/active-user/types";
import BaseComponent from "../base";
import { success } from "../feedback";
import { generateKeys } from "../../helper/generate-private-keys";
import { _t } from "../../i18n";
import truncate from "../../util/truncate";
import "./_index.scss";
import { FormControl, InputGroupCopyClipboard } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

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

  curPassChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          <div className="mb-4">
            <label>{_t("view-keys.account")}</label>
            <FormControl type="text" readOnly={true} value={activeUser.username} />
          </div>
          <div className="mb-4">
            <label>{_t("view-keys.cur-pass")}</label>
            <FormControl
              value={curPass}
              onChange={this.curPassChanged}
              required={true}
              type="password"
              autoFocus={true}
              autoComplete="off"
            />
          </div>
          <div className="mb-4">
            <div>
              {!keys.memo && (
                <Button outline={true} onClick={this.getKeys}>
                  {_t("view-keys.view-keys")}
                </Button>
              )}
              {keys.memo && (
                <div>
                  <div className="mb-4">
                    <label>{_t("view-keys.owner")}</label>
                    <InputGroupCopyClipboard
                      value={keys.owner}
                      visibleValue={truncate(keys.owner, 30)}
                    />
                  </div>
                  <div className="mb-4">
                    <label>{_t("view-keys.active")}</label>
                    <InputGroupCopyClipboard
                      value={keys.active}
                      visibleValue={truncate(keys.active, 30)}
                    />
                  </div>
                  <div className="mb-4">
                    <label>{_t("view-keys.posting")}</label>
                    <InputGroupCopyClipboard
                      value={keys.posting}
                      visibleValue={truncate(keys.posting, 30)}
                    />
                  </div>
                  <div className="mb-4">
                    <label>{_t("view-keys.memo")}</label>
                    <InputGroupCopyClipboard
                      value={keys.memo}
                      visibleValue={truncate(keys.memo, 30)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Form>
      </div>
    );
  }
}
