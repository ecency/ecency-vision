import React from "react";
import defaults from "@/defaults.json";
import { setProxyBase } from "@ecency/render-helper";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import i18next from "i18next";
import { SchedulesList } from "@/features/shared/schedules/schedules-list";

setProxyBase(defaults.imageServer);

interface Props {
  onHide: () => void;
}

export function SchedulesDialog({ onHide }: Props) {
  return (
    <Modal show={true} centered={true} onHide={onHide} size="lg" className="schedules-modal">
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("schedules.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <SchedulesList onHide={onHide} />
      </ModalBody>
    </Modal>
  );
}
