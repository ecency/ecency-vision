import React from "react";
import { setProxyBase } from "@ecency/render-helper";
import defaults from "@/defaults.json";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import i18next from "i18next";
import { GalleryList } from "@/features/shared/gallery/gallery-list";

setProxyBase(defaults.imageServer);

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
  onPick?: (url: string) => void;
}

export function GalleryDialog({ show, setShow, onPick }: Props) {
  return (
    <Modal
      show={show}
      centered={true}
      onHide={() => setShow(false)}
      size="lg"
      className="gallery-modal"
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("gallery.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <GalleryList onPick={onPick} />
      </ModalBody>
    </Modal>
  );
}
