import { Link } from "react-router-dom";
import ToolTip from "../tooltip";
import { brightnessSvg, pencilOutlineSvg } from "../../img/svg";
import { _t } from "../../i18n";
import { Button } from "@ui/button";
import React, { useState } from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import Search from "../search";
import SwitchLang from "../switch-lang";
import { History } from "history";
import * as ls from "../../util/local-storage";
import { NavbarTextMenu } from "./navbar-text-menu";
import { classNameObject } from "../../helper/class-name-object";
import { NavbarSide } from "./navbar-side";
import UserAvatar from "../user-avatar";

interface Props {
  step?: number;
  transparentVerify: boolean;
  logoHref: string;
  logo: string;
  history: History;
  setStepOne?: () => void;
  setSmVisible: (v: boolean) => void;
  themeText: string;
}

export function NavbarDesktop({
  step,
  transparentVerify,
  logo,
  logoHref,
  history,
  setSmVisible,
  setStepOne,
  themeText
}: Props) {
  const { activeUser, toggleUIProp, toggleTheme } = useMappedStore();

  const [showSidebar, setShowSidebar] = useState(false);

  const changeTheme = () => {
    ls.remove("use_system_theme");
    toggleTheme();
  };

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
          {activeUser !== null ? (
            <Link to={logoHref}>
              <img src={logo} className="logo" alt="Logo" />
            </Link>
          ) : (
            <img src={logo} className="logo" alt="Logo" onClick={onLogoClick} />
          )}
        </div>
        <div className="flex-1" />
        <NavbarTextMenu />
        <div className="flex-spacer" />
        {(step !== 1 || transparentVerify) && (
          <div className="max-w-[400px] w-full">
            <Search history={history} />
          </div>
        )}
        <div className="flex items-center ml-3 gap-3">
          <SwitchLang history={history} />
          {(step !== 1 || transparentVerify) && (
            <ToolTip content={themeText}>
              <Button outline={true} icon={brightnessSvg} onClick={changeTheme} />
            </ToolTip>
          )}
          <div>
            <ToolTip content={_t("navbar.post")}>
              <Link to="/submit">
                <Button outline={true} icon={pencilOutlineSvg} />
              </Link>
            </ToolTip>
          </div>
        </div>
        <div className="btn-menu">
          {!activeUser && (
            <div className="login-required flex ml-2 gap-2">
              <Button
                className="btn-login"
                onClick={() => {
                  toggleUIProp("login");
                  setSmVisible(false);
                }}
              >
                {_t("g.login")}
              </Button>

              <Link to="/signup">
                <Button outline={true}>{_t("g.signup")}</Button>
              </Link>
            </div>
          )}
          {activeUser && (
            <div className="cursor-pointer" onClick={() => setShowSidebar(true)}>
              <UserAvatar size="medium" username={activeUser.username} />
            </div>
          )}
        </div>
      </div>
      {activeUser && <NavbarSide history={history} show={showSidebar} setShow={setShowSidebar} />}
    </div>
  );
}
