"use client";

import { useEffect } from "react";

export function FullHeight() {
  useEffect(() => {
    document.getElementById("root")?.classList.add("full-height");
    return () => {
      document.getElementById("root")?.classList.remove("full-height");
    };
  }, []);

  return <></>;
}
