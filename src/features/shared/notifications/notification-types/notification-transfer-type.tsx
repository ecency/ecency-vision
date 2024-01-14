import React, { ReactElement } from "react";
import { ApiTransferNotification } from "@/entities";
import i18next from "i18next";

interface Props {
  sourceLink: ReactElement;
  notification: ApiTransferNotification;
}

export function NotificationTransferType({ sourceLink, notification }: Props) {
  return (
    <div className="item-content">
      <div className="first-line">
        {sourceLink}
        <span className="item-action">
          {i18next.t("notifications.transfer-str")}{" "}
          <span className="transfer-amount">{notification.amount}</span>
        </span>
      </div>
      {notification.memo && (
        <div className="second-line">
          <div className="transfer-memo">
            {notification.memo
              .substring(0, 120)
              .replace("https://peakd.com/", "https://ecency.com/")}
          </div>
        </div>
      )}
    </div>
  );
}
