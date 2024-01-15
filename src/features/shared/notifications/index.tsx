import { Modal, ModalBody } from "@ui/modal";
import React, { useEffect, useState } from "react";
import { NotificationsContent } from "@/features/shared/notifications/notifications-content";
import "./_index.scss";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  className?: string;
  openLinksInNewTab?: boolean;
}

export function NotificationsDialog({ className, openLinksInNewTab = false }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const showNotifications = useGlobalStore((state) => state.uiNotifications);
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);

  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(showNotifications && !!activeUser);
  }, [showNotifications, activeUser]);

  return (
    <Modal
      show={show}
      onHide={() => toggleUIProp("notifications", false)}
      className={"notifications-modal drawer " + className}
      transitionFrom={{
        opacity: 0,
        x: 500
      }}
      transitionEnter={{
        opacity: 1,
        x: 0
      }}
      transitionLeave={{
        opacity: 0,
        x: 500
      }}
    >
      <ModalBody>
        <NotificationsContent openLinksInNewTab={openLinksInNewTab} />
      </ModalBody>
    </Modal>
  );
}
