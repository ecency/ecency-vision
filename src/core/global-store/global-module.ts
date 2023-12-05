import { AllFilter, ListStyle, Theme } from "@/enums";
import { GlobalStore } from "@/core/global-store/typings";

export function createGlobalModule(set: (state: Partial<GlobalStore>) => void) {
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
    notifications: true,
    nsfw: false,
    isMobile: false,
    usePrivate: true,
    hsClientId: "ecency.app",
    lastIndexPath: null
  };
}
