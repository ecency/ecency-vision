import { useEffect } from "react";
import { useGlobalStore } from "@/core/global-store";

export function Theme() {
  const isMobile = useGlobalStore((state) => state.isMobile);
  const theme = useGlobalStore((state) => state.theme);

  useEffect(() => {
    if (["day", "night"].includes(theme)) {
      if (!isMobile) {
        if (theme === "day") {
          document.body.classList.remove("dark");
        } else {
          document.body.classList.add("dark");
        }
      }
    }
  }, [theme]);

  return <></>;
}
