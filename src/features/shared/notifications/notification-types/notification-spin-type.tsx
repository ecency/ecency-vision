import React, { ReactElement } from "react";
import i18next from "i18next";

interface Props {
  sourceLink: ReactElement;
}

export function NotificationSpinType({ sourceLink }: Props) {
  return (
    <div className="item-content">
      <div className="first-line">
        {sourceLink}
        <span className="item-action">{i18next.t("notifications.spin-str")}</span>
      </div>
    </div>
  );
}
