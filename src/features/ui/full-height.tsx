"use client";

import { useEffect } from "react";

export function FullHeight() {
  useEffect(() => {
    document.querySelector(".app-content")?.classList.add("full-height");
    return () => {
      document.querySelector(".app-content")?.classList.remove("full-height");
    };
  }, []);

  return <></>;
}
