import { Button } from "@ui/button";
import React, { useState } from "react";
import { NavbarTextMenu } from "./navbar-text-menu";
import { useGlobalStore } from "@/core/global-store";
import { classNameObject } from "@ui/util";
import { UilEditAlt } from "@iconscout/react-unicons";
import { NavbarMainSidebarToggle } from "@/features/shared/navbar/navbar-main-sidebar-toggle";
import { Search } from "@/features/shared/navbar/search";
import { NavbarPerksButton } from "@/features/shared/navbar/navbar-perks-button";
import { Tooltip } from "@ui/tooltip";
import i18next from "i18next";
import { NavbarNotificationsButton } from "@/features/shared/navbar/navbar-notifications-button";
import { AnonUserButtons } from "@/features/shared/navbar/anon-user-buttons";
import { UserAvatar } from "@/features/shared";
import { NavbarSide } from "@/features/shared/navbar/sidebar/navbar-side";
import { NavbarMainSidebar } from "@/features/shared/navbar/navbar-main-sidebar";

interface Props {
  step?: number;
  transparentVerify: boolean;
  setStepOne?: () => void;
  setSmVisible: (v: boolean) => void;
  mainBarExpanded: boolean;
  setMainBarExpanded: (v: boolean) => void;
}

export function NavbarDesktop({
  step,
  transparentVerify,
  setStepOne,
  mainBarExpanded,
  setMainBarExpanded
}: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);
  const uiNotifications = useGlobalStore((state) => state.uiNotifications);

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
        <NavbarMainSidebarToggle onClick={() => setMainBarExpanded(true)} />
        <div className="flex-1" />
        <NavbarTextMenu />
        <div className="flex-spacer" />
        {(step !== 1 || transparentVerify) && (
          <div className="max-w-[400px] w-full">
            <Search />
          </div>
        )}
        <div className="flex items-center ml-3">
          <NavbarPerksButton />
          <Tooltip content={i18next.t("navbar.post")}>
            <Button href="/submit" appearance="gray-link" className="ml-3" icon={<UilEditAlt />} />
          </Tooltip>
          {activeUser && <NavbarNotificationsButton />}
        </div>
        <div className="btn-menu">
          <AnonUserButtons />
          {activeUser && (
            <div
              className="cursor-pointer ml-4"
              onClick={() => {
                setShowSidebar(true);
                if (uiNotifications) {
                  toggleUIProp("notifications");
                }
              }}
            >
              <UserAvatar size="medium" username={activeUser.username} />
            </div>
          )}
        </div>
      </div>
      {activeUser && <NavbarSide show={showSidebar} setShow={setShowSidebar} />}
      <NavbarMainSidebar
        show={mainBarExpanded}
        setShow={setMainBarExpanded}
        setStepOne={setStepOne}
      />
    </div>
  );
}
