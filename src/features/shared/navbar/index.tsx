"use client";

import React, { useEffect, useState } from "react";
import usePrevious from "react-use/lib/usePrevious";
import * as ls from "@/utils/local-storage";
import { GLOBAL_FILTERS } from "./consts";
import useMount from "react-use/lib/useMount";
import "./_index.scss";
import { NavbarMobile } from "./navbar-mobile";
import { NavbarDesktop } from "./navbar-desktop";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { isCommunity } from "@/utils";
import { Theme } from "@/enums";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import { LoginDialog, NotificationHandler } from "@/features/shared";

interface Props {
  match?: any;
  step?: number;
  setStepOne?: () => void;
  setStepTwo?: () => void;
}

export function Navbar({ match, setStepOne, setStepTwo, step }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const filter = useGlobalStore((state) => state.filter);
  const tag = useGlobalStore((state) => state.tag);
  const theme = useGlobalStore((state) => state.theme);
  const toggleTheme = useGlobalStore((state) => state.toggleTheme);
  const login = useGlobalStore((state) => state.login);
  const usePrivate = useGlobalStore((state) => state.usePrivate);

  const router = useRouter();
  const query = useSearchParams();
  const pathname = usePathname();
  const previousPathname = usePrevious(pathname);

  const [logoHref, setLogoHref] = useState("/");
  const [transparentVerify, setTransparentVerify] = useState(false);
  const [themeText, setThemeText] = useState("");
  const [smVisible, setSmVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const previousActiveUser = usePrevious(activeUser);

  const logo = require("../../../assets/img/logo-circle.svg");

  useMount(() => {
    // referral check / redirect
    if (location.pathname.startsWith("/signup") && query.has("referral")) {
      router.push(`/signup?referral=${query.get("referral")}`);
    }
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", handleSetTheme);

    return () => {
      document.getElementsByTagName("body")[0].classList.remove("overflow-hidden");
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleSetTheme);
    };
  });

  useEffect(() => {
    if (smVisible) {
      document.getElementsByTagName("body")[0].classList.add("overflow-hidden");
    } else {
      document.getElementsByTagName("body")[0].classList.remove("overflow-hidden");
    }
  }, [smVisible]);

  useEffect(() => {
    if (previousPathname !== pathname || previousActiveUser !== activeUser) {
      if (pathname === "/" && !activeUser) {
        setStepOne && setStepOne();
      } else {
        setStepTwo && setStepTwo();
      }
    }
  }, [pathname, previousPathname, activeUser, previousActiveUser]);

  useEffect(() => {
    setTransparentVerify(
      pathname.startsWith("/hot") ||
        pathname.startsWith("/created") ||
        pathname.startsWith("/trending")
    );
  }, [pathname]);

  useEffect(() => {
    const isCommunityPage = match?.params.name && isCommunity(match.params.name);
    const tagValue = tag ? `/${tag}` : "";

    if (activeUser) {
      const isFilter = tag.includes("@") && GLOBAL_FILTERS.includes(filter);

      if (isCommunityPage || isFilter) {
        setLogoHref("/hot");
      } else if (filter === "feed") {
        setLogoHref(`${tagValue}/${filter}`);
      } else {
        setLogoHref(`/${filter}${tagValue}`);
      }
    } else {
      setLogoHref("/");
    }
  }, [activeUser, match, tag]);

  useEffect(() => {
    setThemeText(
      theme == Theme.day ? i18next.t("navbar.night-theme") : i18next.t("navbar.day-theme")
    );
  }, [theme]);

  const handleSetTheme = () => {
    const useSystem = ls.get("use_system_theme", false);
    let theme = ls.get("theme");
    if (useSystem) {
      theme =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? Theme.night
          : Theme.day;
    }
    toggleTheme(theme);
  };

  return (
    <div
      className="fixed z-10 top-0 left-0 right-0 flex flex-col justify-start"
      id="sticky-container"
    >
      <NavbarMobile
        expanded={expanded}
        setExpanded={setExpanded}
        step={step}
        logoHref={logoHref}
        logo={logo}
      />
      <NavbarDesktop
        themeText={themeText}
        transparentVerify={transparentVerify}
        logoHref={logoHref}
        logo={logo}
        step={step}
        setStepOne={setStepOne}
        setSmVisible={setSmVisible}
      />
      {login && <LoginDialog />}
      {usePrivate && <NotificationHandler />}
    </div>
  );
}
