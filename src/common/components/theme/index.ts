import { useEffect } from "react";
import { Global } from "../../store/global/types";

interface Props {
  global: Global;
}

export default (props: Props) => {
  useEffect(() => {
    if (["day", "night"].includes(props.global.theme)) {
      if (!props.global.isMobile) {
        const body = document.querySelector("body");
        if (!body) return;

        body.className = `theme-${props.global.theme}`;
      }
    }
  }, [props.global.theme]);

  return null;
};
