import React from "react";
import defaults from "@/defaults.json";
import { setProxyBase } from "@ecency/render-helper";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import i18next from "i18next";
import { DraftsList } from "@/features/shared/drafts/drafts-list";

setProxyBase(defaults.imageServer);

interface Props {
  onHide: () => void;
  onPick?: (url: string) => void;
}

export function DraftsDialog({ onHide, onPick }: Props) {
  return (
    <Modal show={true} centered={true} onHide={onHide} size="lg" className="drafts-modal">
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("drafts.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <DraftsList onHide={onHide} onPick={onPick} />
      </ModalBody>
    </Modal>
  );
}
