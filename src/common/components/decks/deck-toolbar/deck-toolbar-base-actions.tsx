import { rocketSvg } from "../../../img/svg";
import React from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { WalletBadge } from "../../user-nav";
import { Dropdown } from "react-bootstrap";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import { dotsMenuIconSvg, notificationsIconSvg, walletIconSvg } from "../icons";

interface Props {
  isExpanded: boolean;
  setShowPurchaseDialog: (v: boolean) => void;
}

export const DeckToolbarBaseActions = ({ setShowPurchaseDialog, isExpanded }: Props) => {
  const { activeUser, global, toggleUIProp, notifications, dynamicProps } = useMappedStore();

  return activeUser ? (
    <div className="base-actions">
      {global.usePrivate && (
        <div className="notifications" onClick={() => toggleUIProp("notifications")}>
          {notifications.unread > 0 && (
            <span className="notifications-badge notranslate">
              {notifications.unread.toString().length < 3 ? notifications.unread : "..."}
            </span>
          )}
          {notificationsIconSvg}
        </div>
      )}
      {global.usePrivate && <div onClick={() => setShowPurchaseDialog(true)}>{rocketSvg}</div>}
      <WalletBadge icon={walletIconSvg} activeUser={activeUser} dynamicProps={dynamicProps} />
      {isExpanded ? (
        <Dropdown>
          <DropdownToggle variant="link">{dotsMenuIconSvg}</DropdownToggle>
          <Dropdown.Menu alignRight={true}>
            <Dropdown.Item>Back to Grid</Dropdown.Item>
            <Dropdown.Item>Back to Classic view</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <></>
  );
};
