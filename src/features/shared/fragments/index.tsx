import React from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { Fragments } from "@/features/shared/fragments/fragments-list";
import i18next from "i18next";

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
}

export function FragmentsDialog({ show, setShow }: Props) {
  return (
    <Modal
      show={show}
      centered={true}
      onHide={() => setShow(false)}
      size="lg"
      className="fragments-modal"
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("fragments.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Fragments onHide={() => setShow(false)} />
      </ModalBody>
    </Modal>
  );
}
