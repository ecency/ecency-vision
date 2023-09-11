import { bellSvg, rocketSvg } from "../../../img/svg";
import React from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { WalletBadge } from "../../user-nav";
import { Dropdown } from "react-bootstrap";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import { dotsMenuIconSvg, walletIconSvg } from "../icons";
import { _t } from "../../../i18n";
import Link from "../../alink";

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
  const { activeUser, global, toggleUIProp, notifications, dynamicProps } = useMappedStore();

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
      {isExpanded || !activeUser ? (
        <Dropdown onToggle={() => setIsExpanded(true)}>
          <DropdownToggle variant="link">{dotsMenuIconSvg}</DropdownToggle>
          <Dropdown.Menu alignRight={true}>
            <Dropdown.Item>
              <Link to="/">{_t("decks.back-to-feed")}</Link>
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item>
              <Link to="/fq">{_t("decks.faq")}</Link>
            </Dropdown.Item>
            <Dropdown.Item>
              <Link to="/terms-of-service">{_t("decks.terms")}</Link>
            </Dropdown.Item>
            <Dropdown.Item>
              <Link to="/market">{_t("decks.market")}</Link>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <></>
      )}
    </div>
  );
};
