import { classNameObject } from "../../helper/class-name-object";
import { Link } from "react-router-dom";
import { NavbarTextMenu } from "./navbar-text-menu";
import React from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import { History } from "history";
import { NavbarToggle } from "./navbar-toggle";
import { NavbarDefault } from "./navbar-default";

interface Props {
  step?: number;
  logoHref: string;
  logo: string;
  history: History;
  setStepOne?: () => void;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  transparentVerify: boolean;
  themeText: string;
}

export function NavbarMobile({
  step,
  logoHref,
  logo,
  history,
  setStepOne,
  expanded,
  setExpanded,
  transparentVerify,
  themeText
}: Props) {
  const { activeUser } = useMappedStore();

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
        "flex items-center justify-between bg-light-200 dark:bg-dark-200 md:hidden h-[64px] border-b px-3":
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

      <NavbarToggle onToggle={() => setExpanded(!expanded)} expanded={expanded} />

      {expanded && <NavbarDefault history={history} setSmVisible={() => {}} />}
    </div>
  );
}
