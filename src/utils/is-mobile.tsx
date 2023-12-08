import React, { useEffect } from "react";

export function isMobile() {
  const [screenWidth, setScreenWidth] = React.useState(
    typeof window !== "undefined" && window.innerWidth
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
  });

  // @ts-ignore
  return screenWidth < 570;
}
