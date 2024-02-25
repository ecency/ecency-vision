import { classNameObject } from "../../helper/class-name-object";
import React from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import { History } from "history";
import { NavbarSide } from "./sidebar/navbar-side";
import UserAvatar from "../user-avatar";
import { _t } from "../../i18n";
import { Button } from "@ui/button";
import { NavbarMainSidebar } from "./navbar-main-sidebar";
import { NavbarMainSidebarToggle } from "./navbar-main-sidebar-toggle";
import { NavbarTextMenu } from "./navbar-text-menu";
import ToolTip from "../tooltip";
import { UilEditAlt } from "@iconscout/react-unicons";

interface Props {
  step?: number;
  logoHref: string;
  logo: string;
  history: History;
  setStepOne?: () => void;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  mainBarExpanded: boolean;
  setMainBarExpanded: (v: boolean) => void;
}

export function NavbarMobile({
  step,
  logoHref,
  logo,
  history,
  setStepOne,
  expanded,
  setExpanded,
  mainBarExpanded,
  setMainBarExpanded
}: Props) {
  const { activeUser, toggleUIProp } = useMappedStore();

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
        <ToolTip content={_t("navbar.post")}>
          <Button to="/submit" appearance="gray-link" className="ml-3" icon={<UilEditAlt />} />
        </ToolTip>
        {activeUser && (
          <div className="cursor-pointer ml-4" onClick={() => setExpanded(true)}>
            <UserAvatar size="medium" username={activeUser.username} />
          </div>
        )}
        {!activeUser && (
          <Button className="btn-login" onClick={() => toggleUIProp("login")}>
            {_t("g.login")}
          </Button>
        )}
      </div>

      {activeUser && <NavbarSide history={history} show={expanded} setShow={setExpanded} />}
      <NavbarMainSidebar
        setShow={setMainBarExpanded}
        show={mainBarExpanded}
        setStepOne={setStepOne}
        history={history}
      />
    </div>
  );
}
