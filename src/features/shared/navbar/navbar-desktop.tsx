import { Button } from "@ui/button";
import React from "react";
import { NavbarTextMenu } from "./navbar-text-menu";
import { useGlobalStore } from "@/core/global-store";
import * as ls from "@/utils/local-storage";
import { classNameObject } from "@ui/util";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tooltip } from "@ui/tooltip";
import { brightnessSvg, pencilOutlineSvg } from "@ui/svg";
import i18next from "i18next";
import { SwitchLang } from "../switch-lang";
import { Search } from "./search";
import { UserNav } from "./user-nav";

interface Props {
  step?: number;
  transparentVerify: boolean;
  logoHref: string;
  logo: string;
  setStepOne?: () => void;
  setSmVisible: (v: boolean) => void;
  themeText: string;
}

export function NavbarDesktop({
  step,
  transparentVerify,
  logo,
  logoHref,
  setSmVisible,
  setStepOne,
  themeText
}: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);
  const toggleTheme = useGlobalStore((state) => state.toggleTheme);

  const router = useRouter();

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
      router.push("/");
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
          "max-w-[1600px] w-full mx-auto flex items-center justify-between px-4 py-3 border-b dark:border-dark-200":
            true,
          "bg-light-200 dark:bg-dark-200": true,
          transparent: !transparentVerify && step === 1
        })}
      >
        <div className="h-[40px] min-w-[40px] cursor-pointer">
          {activeUser !== null ? (
            <Link href={logoHref}>
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
            <Search />
          </div>
        )}
        <div className="flex items-center ml-3 gap-3">
          <SwitchLang />
          {(step !== 1 || transparentVerify) && (
            <Tooltip content={themeText}>
              <Button outline={true} icon={brightnessSvg} onClick={changeTheme} />
            </Tooltip>
          )}
          <div>
            <Tooltip content={i18next.t("navbar.post")}>
              <Link href="/submit">
                <Button outline={true} icon={pencilOutlineSvg} />
              </Link>
            </Tooltip>
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
                {i18next.t("g.login")}
              </Button>

              <Link href="/signup">
                <Button outline={true}>{i18next.t("g.signup")}</Button>
              </Link>
            </div>
          )}
          {activeUser && <UserNav />}
        </div>
      </div>
    </div>
  );
}
