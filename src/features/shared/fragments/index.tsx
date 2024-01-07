import React from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { Fragments } from "@/features/shared/fragments/fragments-list";
import i18next from "i18next";

interface Props {
  onHide: () => void;
}

export function FragmentsDialog({ onHide }: Props) {
  return (
    <Modal show={true} centered={true} onHide={onHide} size="lg" className="fragments-modal">
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("fragments.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Fragments onHide={onHide} />
      </ModalBody>
    </Modal>
  );
}
