import React, { useEffect } from "react";

export function isMobile() {
  const [screenWidth, setScreenWidth] = React.useState(
    typeof window !== "undefined" && window.innerWidth
  );

  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
  });

  return screenWidth < 570;
}
