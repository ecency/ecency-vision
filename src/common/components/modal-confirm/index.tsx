import React, { Component } from "react";

import { Button } from "react-bootstrap";

import { _t } from "../../i18n";
import { Modal, ModalFooter, ModalHeader, ModalTitle } from "../modal";

interface Props {
  titleText?: string;
  okText?: string;
  okVariant?: "primary" | "danger";
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default class ModalConfirm extends Component<Props> {
  confirm = () => {
    const { onConfirm } = this.props;
    if (onConfirm) {
      onConfirm();
    }
  };

  cancel = () => {
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel();
    }
  };

  render() {
    const { titleText, okText, okVariant, cancelText } = this.props;

    return (
      <Modal animation={false} show={true} centered={true} onHide={this.cancel}>
        <ModalHeader closeButton={true}>
          <ModalTitle>{titleText || _t("confirm.title")}</ModalTitle>
        </ModalHeader>
        <ModalFooter>
          <Button variant="secondary" onClick={this.cancel}>
            {" "}
            {cancelText || _t("confirm.cancel")}
          </Button>
          <Button variant={okVariant || "primary"} onClick={this.confirm}>
            {" "}
            {okText || _t("confirm.ok")}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
