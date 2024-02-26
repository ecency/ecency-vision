import { Theme } from "../../../store/global/types";
import { brightnessSvg } from "../../../img/svg";
import React from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import * as ls from "../../../util/local-storage";
import "./_navbar-side-theme-switcher.scss";
import { classNameObject } from "../../../helper/class-name-object";

interface Props {
  floatRight?: boolean;
}

export function NavbarSideThemeSwitcher({ floatRight }: Props) {
  const { global, toggleTheme } = useMappedStore();

  const changeTheme = () => {
    ls.remove("use_system_theme");
    toggleTheme();
  };

  return (
    <div
      className={classNameObject({
        "switch-theme": true,
        "ml-[auto]": floatRight,
        switched: global.theme === Theme.night
      })}
      onClick={() => changeTheme()}
    >
      {brightnessSvg}
    </div>
  );
}
