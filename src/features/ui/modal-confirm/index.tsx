import React from "react";
import { Modal, ModalFooter, ModalHeader, ModalTitle } from "@ui/modal";
import { Button, ButtonProps } from "@ui/button";
import i18next from "i18next";

interface Props {
  titleText?: string;
  okText?: string;
  okVariant?: ButtonProps["appearance"];
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ModalConfirm({
  titleText,
  okText,
  onConfirm,
  cancelText,
  onCancel,
  okVariant
}: Props) {
  return (
    <Modal animation={false} show={true} centered={true} onHide={() => onCancel?.()}>
      <ModalHeader closeButton={true}>
        <ModalTitle>{titleText || i18next.t("confirm.title")}</ModalTitle>
      </ModalHeader>
      <ModalFooter className="flex gap-3">
        <Button appearance="secondary" outline={true} onClick={() => onCancel?.()}>
          {" "}
          {cancelText || i18next.t("confirm.cancel")}
        </Button>
        <Button appearance={okVariant ?? "primary"} onClick={() => onConfirm?.()}>
          {" "}
          {okText || i18next.t("confirm.ok")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
