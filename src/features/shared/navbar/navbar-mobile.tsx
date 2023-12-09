import { NavbarTextMenu } from "./navbar-text-menu";
import React from "react";
import { NavbarToggle } from "./navbar-toggle";
import { NavbarDefault } from "./navbar-default";
import { useGlobalStore } from "@/core/global-store";
import { useRouter } from "next/navigation";
import { classNameObject } from "@ui/util";
import Link from "next/link";

interface Props {
  step?: number;
  logoHref: string;
  logo: string;
  setStepOne?: () => void;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}

export function NavbarMobile({ step, logoHref, logo, setStepOne, expanded, setExpanded }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  const router = useRouter();

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
      className={classNameObject({
        "flex items-center justify-between bg-light-200 dark:bg-dark-200 md:hidden h-[64px] border-b border-[--border-color] px-3":
          true,
        transparent: step === 1
      })}
    >
      <div className="h-[40px] w-[40px] shrink-0 cursor-pointer">
        {activeUser !== null ? (
          <Link href={logoHref}>
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
