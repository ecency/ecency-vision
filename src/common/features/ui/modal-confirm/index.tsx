import React, { Component } from "react";
import { Modal, ModalFooter, ModalHeader, ModalTitle } from "@ui/modal";
import { _t } from "../../../i18n";
import { Button, ButtonProps } from "@ui/button";

interface Props {
  titleText?: string;
  okText?: string;
  okVariant?: ButtonProps["appearance"];
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
        <ModalFooter className="flex gap-3">
          <Button appearance="secondary" outline={true} onClick={this.cancel}>
            {" "}
            {cancelText || _t("confirm.cancel")}
          </Button>
          <Button appearance={okVariant ?? "primary"} onClick={this.confirm}>
            {" "}
            {okText || _t("confirm.ok")}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
