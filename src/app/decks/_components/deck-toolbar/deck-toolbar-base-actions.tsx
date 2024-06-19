import { bellSvg, rocketSvg } from "../../../img/svg";
import React, { useState } from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { WalletBadge } from "../../../components/navbar/user-nav";
import { dotsMenuIconSvg, walletIconSvg } from "../icons";
import { NavbarMainSidebar } from "../../../components/navbar/navbar-main-sidebar";
import { Button } from "@ui/button";
import { History } from "history";

interface Props {
  isExpanded: boolean;
  setShowPurchaseDialog: (v: boolean) => void;
  setIsExpanded: (v: boolean) => void;
  history: History;
}

export const DeckToolbarBaseActions = ({
  setShowPurchaseDialog,
  isExpanded,
  setIsExpanded,
  history
}: Props) => {
  const { activeUser, global, toggleUIProp, notifications, dynamicProps } = useMappedStore();
  const [showMainSide, setShowMainSide] = useState(false);

  return (
    <div className="base-actions">
      {activeUser && (
        <>
          {global.usePrivate && (
            <div className="notifications" onClick={() => toggleUIProp("notifications")}>
              {notifications.unread > 0 && (
                <span className="notifications-badge notranslate">
                  {notifications.unread.toString().length < 3 ? notifications.unread : "..."}
                </span>
              )}
              {bellSvg}
            </div>
          )}
          {global.usePrivate && <div onClick={() => setShowPurchaseDialog(true)}>{rocketSvg}</div>}
          <WalletBadge icon={walletIconSvg} />
        </>
      )}
      <Button appearance="link" onClick={() => setShowMainSide(true)} style={{ height: "56px" }}>
        {dotsMenuIconSvg}
      </Button>
      <NavbarMainSidebar show={showMainSide} setShow={setShowMainSide} history={history} />
    </div>
  );
};
