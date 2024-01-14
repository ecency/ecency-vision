import { Modal, ModalBody } from "@ui/modal";
import React from "react";
import { NotificationsContent } from "@/features/shared/notifications/notifications-content";
import "./_index.scss";

interface Props {
  onHide: () => void;
  className?: string;
  openLinksInNewTab?: boolean;
}

export function NotificationsDialog({ onHide, className, openLinksInNewTab = false }: Props) {
  return (
    <Modal show={true} onHide={onHide} className={"notifications-modal drawer " + className}>
      <ModalBody>
        <NotificationsContent openLinksInNewTab={openLinksInNewTab} />
      </ModalBody>
    </Modal>
  );
}
