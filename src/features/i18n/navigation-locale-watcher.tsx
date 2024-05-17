import { useSearchParams } from "next/navigation";
import i18next from "i18next";
import { langOptions } from "@/features/i18n";
import { useGlobalStore } from "@/core/global-store";
import { NavigationLocaleWatcherClient } from "@/features/navigation-locale-watcher-client";

export async function NavigationLocaleWatcher() {
  const params = useSearchParams();
  const languageFromList = langOptions.find(
    (item) => item.code.split("-")[0] === params.get("lang")
  );

  const setLang = useGlobalStore((state) => state.setLang);

  if (languageFromList) {
    await i18next.changeLanguage(languageFromList.code);
    setLang(languageFromList.code);
  }

  return (
    <>
      <NavigationLocaleWatcherClient />
    </>
  );
}
