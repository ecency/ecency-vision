import { Link } from "react-router-dom";
import ToolTip from "../tooltip";
import { brightnessSvg, pencilOutlineSvg } from "../../img/svg";
import { _t } from "../../i18n";
import { Button } from "@ui/button";
import React from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import Search from "../search";
import SwitchLang from "../switch-lang";
import { History } from "history";
import * as ls from "../../util/local-storage";
import { NavbarTextMenu } from "./navbar-text-menu";
import { classNameObject } from "../../helper/class-name-object";
import { UserNav } from "../user-nav";

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
          "max-w-[1600px] w-full mx-auto flex items-center justify-between px-4 py-3 border-b":
            true,
          "bg-light-200 dark:bg-dark-200": true,
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
            <div>
              <div className="login-required">
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
              <div className="submit-post">
                <ToolTip content={_t("navbar.post")}>
                  <Link className="btn btn-outline-primary" to="/submit">
                    {pencilOutlineSvg}
                  </Link>
                </ToolTip>
              </div>
            </div>
          )}
          {activeUser && <UserNav history={history} />}
        </div>
      </div>
    </div>
  );
}
