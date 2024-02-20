import { classNameObject } from "../../helper/class-name-object";
import { Link } from "react-router-dom";
import { NavbarTextMenu } from "./navbar-text-menu";
import React from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import { History } from "history";
import { NavbarSide } from "./sidebar/navbar-side";
import UserAvatar from "../user-avatar";
import { _t } from "../../i18n";
import { Button } from "@ui/button";

interface Props {
  step?: number;
  logoHref: string;
  logo: string;
  history: History;
  setStepOne?: () => void;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}

export function NavbarMobile({
  step,
  logoHref,
  logo,
  history,
  setStepOne,
  expanded,
  setExpanded
}: Props) {
  const { activeUser, toggleUIProp } = useMappedStore();

  const onLogoClick = () => {
    if (
      "/" !== location.pathname ||
      location.pathname?.startsWith("/hot") ||
      location.pathname?.startsWith("/created") ||
      location.pathname?.startsWith("/trending")
    ) {
      history.push("/");
    }
    setStepOne?.();
  };

  return (
    <div
      className={classNameObject({
        "flex items-center justify-between bg-light-200 dark:bg-dark-200 md:hidden h-[64px] border-b border-[--border-color] px-3":
          true,
        transparent: step === 1
      })}
    >
      <div className="h-[40px] w-[40px] shrink-0 cursor-pointer">
        {activeUser !== null ? (
          <Link to={logoHref}>
            <img src={logo} className="h-[40px] w-[40px]" alt="Logo" />
          </Link>
        ) : (
          <img src={logo} className="h-[40px] w-[40px]" alt="Logo" onClick={onLogoClick} />
        )}
      </div>

      <NavbarTextMenu />

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
    </div>
  );
}
