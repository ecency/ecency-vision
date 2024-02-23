import { classNameObject } from "../../helper/class-name-object";
import React from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import { History } from "history";
import { NavbarSide } from "./sidebar/navbar-side";
import UserAvatar from "../user-avatar";
import { _t } from "../../i18n";
import { Button } from "@ui/button";
import { NavbarMainSidebar } from "./navbar-main-sidebar";

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
      <div className="h-[40px] w-[40px] shrink-0 cursor-pointer">
        <img
          src={logo}
          className="h-[40px] w-[40px]"
          alt="Logo"
          onClick={() => setMainBarExpanded(true)}
        />
      </div>

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
