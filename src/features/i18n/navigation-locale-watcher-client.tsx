"use client";

import useMount from "react-use/lib/useMount";
import * as ls from "@/utils/local-storage";
import { useSearchParams } from "next/navigation";
import { langOptions } from "@/features/i18n/index";
import { useCallback, useMemo } from "react";
import { useGlobalStore } from "@/core/global-store";
import useUnmount from "react-use/lib/useUnmount";
import i18next from "i18next";
import moment from "moment";

export function NavigationLocaleWatcherClient() {
  const params = useSearchParams();
  const languageFromList = useMemo(
    () => langOptions.find((item) => item.code.split("-")[0] === params.get("lang")),
    [params]
  );

  const lang = useGlobalStore((state) => state.lang);
  const setLang = useGlobalStore((state) => state.setLang);

  const localeChanged = useCallback((lang: string) => moment.locale(lang), []);

  useMount(() => {
    if (languageFromList && lang !== languageFromList.code) {
      ls.set("current-language", lang);
    }

    i18next.on("languageChanged", localeChanged);
  });

  useUnmount(() => {
    const currentLang = ls.get("current-language");
    setLang(currentLang);
    i18next.changeLanguage(currentLang);
    i18next.off("languageChanged", localeChanged);
  });

  return <></>;
}
