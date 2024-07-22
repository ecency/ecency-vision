"use client";

import React, { useEffect, useState } from "react";
import { NotificationsContent } from "@/features/shared/notifications/notifications-content";
import "./_index.scss";
import { useGlobalStore } from "@/core/global-store";
import { ModalSidebar } from "@ui/modal/modal-sidebar";

export * from "./notification-list-item";

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
    <ModalSidebar
      className="notifications-modal min-w-[32rem]"
      show={show}
      setShow={setShow}
      placement="right"
    >
      <NotificationsContent openLinksInNewTab={openLinksInNewTab} />
    </ModalSidebar>
  );
}
