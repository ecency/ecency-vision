import React, { Component } from "react";

import { Button, Form, FormControl } from "react-bootstrap";

import BaseComponent from "../base";
import { error } from "../feedback";

import { BeneficiaryRoute } from "../../api/operations";

import { getAccount } from "../../api/hive";

import { _t } from "../../i18n";

import { accountMultipleSvg, deleteForeverSvg, plusSvg } from "../../img/svg";
import { handleInvalid, handleOnInput } from "../../util/input-util";
import "./_index.scss";
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from "@ui/modal";
import { InputGroup } from "@ui/input";

interface Props {
  author?: string;
  list: BeneficiaryRoute[];
  onAdd: (item: BeneficiaryRoute) => void;
  onDelete: (username: string) => void;
}

interface DialogBodyState {
  username: string;
  percentage: string;
  inProgress: boolean;
}

export class DialogBody extends BaseComponent<Props, DialogBodyState> {
  state: DialogBodyState = {
    username: "",
    percentage: "",
    inProgress: false
  };

  form = React.createRef<HTMLFormElement>();

  usernameChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const username = e.target.value.trim().toLowerCase();
    this.stateSet({ username });
  };

  percentageChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    this.stateSet({ percentage: e.target.value });
  };

  render() {
    const { list, author } = this.props;
    const { username, percentage, inProgress } = this.state;

    const used = list.reduce((a, b) => a + b.weight / 100, 0);
    const available = 100 - used;

    return (
      <Form
        ref={this.form}
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          e.stopPropagation();

          if (!this.form.current?.checkValidity()) {
            return;
          }

          const { onAdd, list } = this.props;
          const { username, percentage } = this.state;

          if (list.find((x) => x.account === username) !== undefined) {
            error(_t("beneficiary-editor.user-exists-error", { n: username }));
            return;
          }

          this.stateSet({ inProgress: true });
          getAccount(username)
            .then((r) => {
              if (!r) {
                error(_t("beneficiary-editor.user-error", { n: username }));
                return;
              }

              onAdd({
                account: username,
                weight: Number(percentage) * 100
              });

              this.stateSet({ username: "", percentage: "" });
            })
            .finally(() => this.stateSet({ inProgress: false }));
        }}
      >
        <div className="beneficiary-list">
          <table className="table-auto w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">{_t("beneficiary-editor.username")}</th>
                <th className="border p-2">{_t("beneficiary-editor.reward")}</th>
                <th className="border p-2" />
              </tr>
            </thead>
            <tbody>
              {author && available > 0 && (
                <tr>
                  <td className="border p-2">{`@${author}`}</td>
                  <td className="border p-2">{`${available}%`}</td>
                  <td className="border p-2" />
                </tr>
              )}
              <tr>
                <td className="border p-2">
                  <InputGroup prepend="@">
                    <Form.Control
                      disabled={inProgress}
                      autoFocus={true}
                      required={true}
                      minLength={3}
                      maxLength={20}
                      value={username}
                      onInvalid={(e: any) =>
                        handleInvalid(e, "beneficiary-editor.", "validation-username")
                      }
                      onInput={handleOnInput}
                      onChange={this.usernameChanged}
                    />
                  </InputGroup>
                </td>
                <td className="border p-2">
                  <InputGroup append="%">
                    <Form.Control
                      disabled={inProgress}
                      required={true}
                      type="number"
                      size="sm"
                      min={1}
                      max={available}
                      step={1}
                      value={percentage}
                      onChange={this.percentageChanged}
                      onInvalid={(e: any) =>
                        handleInvalid(e, "beneficiary-editor.", "validation-percentage")
                      }
                      onInput={handleOnInput}
                    />
                  </InputGroup>
                </td>
                <td className="border p-2">
                  <Button disabled={inProgress || available < 1} size="sm" type="submit">
                    {plusSvg}
                  </Button>
                </td>
              </tr>
              {list.map((x) => {
                return (
                  <tr key={x.account}>
                    <td className="border p-2">{`@${x.account}`}</td>
                    <td className="border p-2">{`${x.weight / 100}%`}</td>
                    <td className="border p-2">
                      <Button
                        onClick={() => {
                          const { onDelete } = this.props;
                          onDelete(x.account);
                        }}
                        variant="danger"
                        size="sm"
                      >
                        {deleteForeverSvg}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Form>
    );
  }
}

interface State {
  visible: boolean;
}

export default class BeneficiaryEditorDialog extends Component<Props, State> {
  state: State = {
    visible: false
  };

  toggle = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  render() {
    const { list } = this.props;
    const { visible } = this.state;

    const btnLabel =
      list.length > 0
        ? _t("beneficiary-editor.btn-label-n", { n: list.length })
        : _t("beneficiary-editor.btn-label");

    return (
      <>
        <Button size="sm" onClick={this.toggle}>
          {btnLabel}
          <span style={{ marginLeft: "6px" }}>{accountMultipleSvg}</span>
        </Button>

        {visible && (
          <Modal
            onHide={this.toggle}
            show={true}
            centered={true}
            animation={false}
            className="beneficiary-editor-dialog"
          >
            <ModalHeader closeButton={true}>
              <ModalTitle>{_t("beneficiary-editor.title")}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <DialogBody {...this.props} />
            </ModalBody>
            <ModalFooter>
              <Button variant="primary" onClick={this.toggle}>
                {_t("g.done")}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </>
    );
  }
}
