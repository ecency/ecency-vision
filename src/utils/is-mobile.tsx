import { useEffect, useState } from "react";

export function useIsMobile() {
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" && window.innerWidth
  );

  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
  });

  // @ts-ignore
  return screenWidth < 570;
}
