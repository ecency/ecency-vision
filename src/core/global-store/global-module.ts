import Cookies from "js-cookie";
import { AllFilter, ListStyle, Theme } from "@/enums";
import * as ls from "@/utils/local-storage";

export function createGlobalState() {
  return {
    filter: AllFilter.hot,
    tag: "",
    theme: Theme.day,
    listStyle: ListStyle.row,
    intro: true,
    currency: "hbd",
    currencyRate: 1,
    currencySymbol: "$",
    lang: "en-US",
    searchIndexCount: 0,
    canUseWebp: false,
    hasKeyChain: false,
    newVersion: null,
    globalNotifications: true,
    nsfw: false,
    isMobile: false,
    usePrivate: true,
    hsClientId: "ecency.app",
    lastIndexPath: null
  };
}

type State = ReturnType<typeof createGlobalState>;

export function createGlobalActions(set: (state: Partial<State>) => void, getState: () => State) {
  return {
    toggleTheme: (theme_key?: Theme) => {
      const { theme, isMobile } = getState();
      let newTheme: any = theme === Theme.day ? Theme.night : Theme.day;

      if (!!theme_key) {
        newTheme = theme_key;
      }

      const use_system = ls.get("use_system_theme", false);
      if (use_system) {
        newTheme =
          window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
            ? Theme.night
            : Theme.day;
      }

      ls.set("theme", newTheme);
      Cookies.set("theme", newTheme, { expires: 365 });

      set({
        theme: newTheme
      });
      let body: any = document.getElementsByTagName("body");
      if (!body) return;
      body = body[0];
      if (theme === "night") {
        body.classList.remove("dark");
      } else {
        body.classList.add("dark");
      }
    },
    setLang: (lang: string) => {
      ls.set("lang", lang);
      set({
        lang
      });
    }
  };
}
