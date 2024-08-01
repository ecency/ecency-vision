import { useGlobalStore } from "@/core/global-store";
import useMount from "react-use/lib/useMount";
import * as ls from "@/utils/local-storage";
import Cookies from "js-cookie";
import { getDynamicPropsQuery } from "@/api/queries";
import { initI18next } from "@/features/i18n";

export function ClientInit() {
  const setActiveUser = useGlobalStore((state) => state.setActiveUser);
  const updateActiveUser = useGlobalStore((state) => state.updateActiveUser);

  useMount(() => {
    initI18next();

    const activeUsername = ls.get("active_user") ?? Cookies.get("active_user");
    if (activeUsername) {
      setActiveUser(activeUsername);
      updateActiveUser();
    }

    getDynamicPropsQuery().prefetch();
  });

  return <></>;
}
