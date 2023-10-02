import { History } from "history";
import { useMappedStore } from "../../store/use-mapped-store";
import { useLocation } from "react-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import usePrevious from "react-use/lib/usePrevious";
import queryString from "query-string";
import isCommunity from "../../helper/is-community";
import { Theme } from "../../store/global/types";
import { _t } from "../../i18n";
import * as ls from "../../util/local-storage";
import { GLOBAL_FILTERS } from "./consts";
import useMount from "react-use/lib/useMount";
import "./_index.scss";
import { NavbarMobile } from "./navbar-mobile";
import { NavbarDesktop } from "./navbar-desktop";

interface Props {
  match?: any;
  history: History;
  step?: number;
  setStepOne?: () => void;
  setStepTwo?: () => void;
}

export function Navbar({ match, history, setStepOne, setStepTwo, step }: Props) {
  const { activeUser, global, ui, setActiveUser, toggleUIProp, toggleTheme } = useMappedStore();
  const location = useLocation();

  const [logoHref, setLogoHref] = useState("/");
  const [transparentVerify, setTransparentVerify] = useState(false);
  const [themeText, setThemeText] = useState("");
  const [smVisible, setSmVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const previousLocation = usePrevious(location);
  const previousActiveUser = usePrevious(activeUser);

  const navRef = useRef<any>();

  const logo = useMemo(
    () => (global.isElectron ? "./img/logo-circle.svg" : require("../../img/logo-circle.svg")),
    []
  );

  useMount(() => {
    // referral check / redirect
    const qs = queryString.parse(location.search);
    if (location.pathname.startsWith("/signup") && qs.referral) {
      history.push(`/signup?referral=${qs.referral}`);
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
    if (previousLocation?.pathname !== location.pathname || previousActiveUser !== activeUser) {
      if (location.pathname === "/" && !activeUser) {
        setStepOne && setStepOne();
      } else {
        setStepTwo && setStepTwo();
      }
    }
  }, [location, activeUser]);

  useEffect(() => {
    setTransparentVerify(
      location.pathname?.startsWith("/hot") ||
        location.pathname?.startsWith("/created") ||
        location.pathname?.startsWith("/trending")
    );
  }, [location]);

  useEffect(() => {
    const isCommunityPage = match?.params.name && isCommunity(match.params.name);
    const tagValue = global.tag ? `/${global.tag}` : "";

    if (activeUser) {
      const isFilter = global.tag.includes("@") && GLOBAL_FILTERS.includes(global.filter);

      if (isCommunityPage || isFilter) {
        setLogoHref("/hot");
      } else if (global.filter === "feed") {
        setLogoHref(`${tagValue}/${global.filter}`);
      } else {
        setLogoHref(`/${global.filter}${tagValue}`);
      }
    } else {
      setLogoHref("/");
    }
  }, [activeUser, match, global.tag]);

  useEffect(() => {
    setThemeText(global.theme == Theme.day ? _t("navbar.night-theme") : _t("navbar.day-theme"));
  }, [global.theme]);

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
        transparentVerify={transparentVerify}
        themeText={themeText}
        expanded={expanded}
        setExpanded={setExpanded}
        step={step}
        logoHref={logoHref}
        logo={logo}
        history={history}
      />
      <NavbarDesktop
        themeText={themeText}
        transparentVerify={transparentVerify}
        logoHref={logoHref}
        logo={logo}
        step={step}
        setStepOne={setStepOne}
        history={history}
        setSmVisible={setSmVisible}
      />
    </div>
  );
}

export default Navbar;
