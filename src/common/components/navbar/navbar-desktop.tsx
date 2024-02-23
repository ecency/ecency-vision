import ToolTip from "../tooltip";
import { _t } from "../../i18n";
import { Button } from "@ui/button";
import React, { useState } from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import Search from "../search";
import { History } from "history";
import { NavbarTextMenu } from "./navbar-text-menu";
import { classNameObject } from "../../helper/class-name-object";
import { NavbarSide } from "./sidebar/navbar-side";
import UserAvatar from "../user-avatar";
import UserNotifications from "../notifications";
import { NavbarNotificationsButton } from "./navbar-notifications-button";
import { UilEditAlt } from "@iconscout/react-unicons";
import { NavbarPerksButton } from "./navbar-perks-button";
import { AnonUserButtons } from "./anon-user-buttons";
import { NavbarMainSidebar } from "./navbar-main-sidebar";

interface Props {
  step?: number;
  transparentVerify: boolean;
  logoHref: string;
  logo: string;
  history: History;
  setStepOne?: () => void;
  setSmVisible: (v: boolean) => void;
  themeText: string;
  mainBarExpanded: boolean;
  setMainBarExpanded: (v: boolean) => void;
}

export function NavbarDesktop({
  step,
  transparentVerify,
  logo,
  history,
  setStepOne,
  mainBarExpanded,
  setMainBarExpanded
}: Props) {
  const { activeUser, ui, toggleUIProp } = useMappedStore();

  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div
      className={`hidden md:flex w-full select-none relative ${
        !transparentVerify && step === 1 ? "transparent" : ""
      } `}
    >
      <div
        className={classNameObject({
          "max-w-[1600px] w-full mx-auto flex items-center justify-between px-4 py-3 border-b dark:border-gray-800":
            true,
          "bg-white dark:bg-dark-700": true,
          transparent: !transparentVerify && step === 1
        })}
      >
        <div className="h-[40px] min-w-[40px] cursor-pointer">
          <img src={logo} className="logo" alt="Logo" onClick={() => setMainBarExpanded(true)} />
        </div>
        <div className="flex-1" />
        <NavbarTextMenu />
        <div className="flex-spacer" />
        {(step !== 1 || transparentVerify) && (
          <div className="max-w-[400px] w-full">
            <Search history={history} />
          </div>
        )}
        <div className="flex items-center ml-3">
          <NavbarPerksButton />
          <ToolTip content={_t("navbar.post")}>
            <Button to="/submit" appearance="gray-link" className="ml-3" icon={<UilEditAlt />} />
          </ToolTip>
          {activeUser && <NavbarNotificationsButton />}
        </div>
        <div className="btn-menu">
          <AnonUserButtons />
          {activeUser && (
            <div className="cursor-pointer ml-4" onClick={() => setShowSidebar(true)}>
              <UserAvatar size="medium" username={activeUser.username} />
            </div>
          )}
        </div>
      </div>
      {ui.notifications && <UserNotifications history={history} />}
      {activeUser && <NavbarSide history={history} show={showSidebar} setShow={setShowSidebar} />}
      <NavbarMainSidebar
        show={mainBarExpanded}
        setShow={setMainBarExpanded}
        history={history}
        setStepOne={setStepOne}
      />
    </div>
  );
}
