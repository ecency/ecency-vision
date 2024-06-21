import React, { useState } from "react";
import { dotsMenuIconSvg, walletIconSvg } from "../icons";
import { Button } from "@ui/button";
import { useGlobalStore } from "@/core/global-store";
import { useNotificationUnreadCountQuery } from "@/api/queries";
import { bellSvg, rocketSvg } from "@ui/svg";
import { NavbarMainSidebar } from "@/features/shared/navbar/navbar-main-sidebar";
import { WalletBadge } from "@/features/shared";

interface Props {
  isExpanded: boolean;
  setShowPurchaseDialog: (v: boolean) => void;
  setIsExpanded: (v: boolean) => void;
}

export const DeckToolbarBaseActions = ({
  setShowPurchaseDialog,
  isExpanded,
  setIsExpanded
}: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const setActiveUser = useGlobalStore((s) => s.setActiveUser);
  const toggleUIProp = useGlobalStore((s) => s.toggleUiProp);
  const uiNotifications = useGlobalStore((s) => s.uiNotifications);
  const usePrivate = useGlobalStore((s) => s.usePrivate);
  const uiLogin = useGlobalStore((s) => s.login);

  const { data: unread } = useNotificationUnreadCountQuery();

  const [showMainSide, setShowMainSide] = useState(false);

  return (
    <div className="base-actions">
      {activeUser && (
        <>
          {usePrivate && (
            <div className="notifications" onClick={() => toggleUIProp("notifications")}>
              {unread > 0 && (
                <span className="notifications-badge notranslate">
                  {unread.toString().length < 3 ? unread : "..."}
                </span>
              )}
              {bellSvg}
            </div>
          )}
          {usePrivate && <div onClick={() => setShowPurchaseDialog(true)}>{rocketSvg}</div>}
          <WalletBadge icon={walletIconSvg} />
        </>
      )}
      <Button appearance="link" onClick={() => setShowMainSide(true)} style={{ height: "56px" }}>
        {dotsMenuIconSvg}
      </Button>
      <NavbarMainSidebar show={showMainSide} setShow={setShowMainSide} />
    </div>
  );
};
