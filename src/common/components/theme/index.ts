import { useEffect } from "react";
import { Global } from "../../store/global/types";

interface Props {
  global: Global;
}

export default (props: Props) => {
  useEffect(() => {
    if (["day", "night"].includes(props.global.theme)) {
      if (!props.global.isMobile) {
        if (props.global.theme === "day") {
          document.body.classList.remove("dark");
        } else {
          document.body.classList.add("dark");
        }
      }
    }
  }, [props.global.theme]);

  return null;
};
