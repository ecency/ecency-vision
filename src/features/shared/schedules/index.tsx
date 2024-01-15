import React from "react";
import defaults from "@/defaults.json";
import { setProxyBase } from "@ecency/render-helper";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import i18next from "i18next";
import { SchedulesList } from "@/features/shared/schedules/schedules-list";

setProxyBase(defaults.imageServer);

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
}

export function SchedulesDialog({ show, setShow }: Props) {
  return (
    <Modal
      show={show}
      centered={true}
      onHide={() => setShow(false)}
      size="lg"
      className="schedules-modal"
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("schedules.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <SchedulesList onHide={() => setShow(false)} />
      </ModalBody>
    </Modal>
  );
}
