import "./_navbar-side-theme-switcher.scss";
import { classNameObject } from "@ui/util";
import { Theme } from "@/enums";
import { brightnessSvg } from "@ui/svg";
import { useGlobalStore } from "@/core/global-store";
import * as ls from "@/utils/local-storage";

interface Props {
  floatRight?: boolean;
}

export function NavbarSideThemeSwitcher({ floatRight }: Props) {
  const theme = useGlobalStore((state) => state.theme);
  const toggleTheme = useGlobalStore((state) => state.toggleTheme);

  const changeTheme = () => {
    ls.remove("use_system_theme");
    toggleTheme();
  };

  return (
    <div
      className={classNameObject({
        "switch-theme": true,
        "ml-[auto]": floatRight,
        switched: theme === Theme.night
      })}
      onClick={() => changeTheme()}
    >
      {brightnessSvg}
    </div>
  );
}
