import { bellOffSvg, bellSvg } from "../../../img/svg";
import React from "react";
import { useMappedStore } from "../../../store/use-mapped-store";

export const DeckToolbarBaseActions = () => {
  const { activeUser, global, toggleUIProp, notifications } = useMappedStore();

  return activeUser ? (
    <div className="base-actions">
      {global.usePrivate && (
        <div className="notifications" onClick={() => toggleUIProp("notifications")}>
          {notifications.unread > 0 && (
            <span className="notifications-badge notranslate">
              {notifications.unread.toString().length < 3 ? notifications.unread : "..."}
            </span>
          )}
          {global.notifications ? bellSvg : bellOffSvg}
        </div>
      )}
    </div>
  ) : (
    <></>
  );
};
