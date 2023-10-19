import { bellSvg, rocketSvg } from "../../../img/svg";
import React from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { WalletBadge } from "../../user-nav";
import { dotsMenuIconSvg, walletIconSvg } from "../icons";
import { _t } from "../../../i18n";
import Link from "../../alink";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { Button } from "@ui/button";

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
        <Dropdown>
          <DropdownToggle onClick={() => setIsExpanded(true)}>
            <Button appearance="link">{dotsMenuIconSvg}</Button>
          </DropdownToggle>
          <DropdownMenu align="right">
            <DropdownItem>
              <Link to="/">{_t("decks.back-to-feed")}</Link>
            </DropdownItem>
            <hr />
            <DropdownItem>
              <Link to="/fq">{_t("decks.faq")}</Link>
            </DropdownItem>
            <DropdownItem>
              <Link to="/terms-of-service">{_t("decks.terms")}</Link>
            </DropdownItem>
            <DropdownItem>
              <Link to="/market">{_t("decks.market")}</Link>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <></>
      )}
    </div>
  );
};
