import { NavbarTextMenu } from "./navbar-text-menu";
import React from "react";
import { useGlobalStore } from "@/core/global-store";
import { classNameObject } from "@ui/util";
import { UilEditAlt } from "@iconscout/react-unicons";
import { NavbarMainSidebarToggle } from "@/features/shared/navbar/navbar-main-sidebar-toggle";
import { Tooltip } from "@ui/tooltip";
import i18next from "i18next";
import { Button } from "@ui/button";
import { UserAvatar } from "@/features/shared";
import { NavbarSide } from "@/features/shared/navbar/sidebar/navbar-side";
import { NavbarMainSidebar } from "@/features/shared/navbar/navbar-main-sidebar";

interface Props {
  step?: number;
  setStepOne?: () => void;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  mainBarExpanded: boolean;
  setMainBarExpanded: (v: boolean) => void;
}

export function NavbarMobile({
  step,
  setStepOne,
  expanded,
  setExpanded,
  mainBarExpanded,
  setMainBarExpanded
}: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);

  return (
    <div
      className={classNameObject({
        "flex items-center justify-between bg-light-200 dark:bg-dark-200 md:hidden h-[64px] border-b border-[--border-color] px-3":
          true,
        transparent: step === 1
      })}
    >
      <NavbarMainSidebarToggle onClick={() => setMainBarExpanded(true)} />
      <NavbarTextMenu />

      <div className="flex items-center ml-3">
        <Tooltip content={i18next.t("navbar.post")}>
          <Button
            href="/submit"
            appearance="gray-link"
            className="ml-3"
            icon={<UilEditAlt width={20} height={20} />}
          />
        </Tooltip>
        {activeUser && (
          <div className="cursor-pointer ml-4" onClick={() => setExpanded(true)}>
            <UserAvatar size="medium" username={activeUser.username} />
          </div>
        )}
        {!activeUser && (
          <Button className="btn-login" onClick={() => toggleUIProp("login")}>
            {i18next.t("g.login")}
          </Button>
        )}
      </div>

      {activeUser && <NavbarSide show={expanded} setShow={setExpanded} />}
      <NavbarMainSidebar
        setShow={setMainBarExpanded}
        show={mainBarExpanded}
        setStepOne={setStepOne}
      />
    </div>
  );
}
