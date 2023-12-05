import { AllFilter, EntryFilter, ListStyle, ProfileFilter, Theme } from "@/enums";

export interface GlobalStore {
  global: {
    filter: EntryFilter | ProfileFilter | AllFilter;
    tag: string;
    theme: Theme;
    listStyle: ListStyle;
    intro: boolean;
    currency: string;
    currencyRate: number;
    currencySymbol: string;
    lang: string;
    searchIndexCount: number;
    canUseWebp: boolean;
    hasKeyChain: boolean;
    newVersion: string | null;
    notifications: boolean;
    nsfw: boolean;
    isMobile: boolean;
    usePrivate: boolean;
    hsClientId: string;
    lastIndexPath: string | null;
  };
}
