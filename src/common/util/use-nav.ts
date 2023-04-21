import { useEffect, useState } from "react";

export const useNav = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const nav = document.querySelector(".sticky-container");
    if (nav) {
      show ? nav.removeAttribute("hidden") : nav.setAttribute("hidden", "");
    }
  }, [show]);

  return { setNavShow: setShow };
};
