"use client";

import { useLayoutEffect } from "react";
import usePrevious from "react-use/lib/usePrevious";

export function FaqSearchListener({ searchResult }: { searchResult: string[] }) {
  const prev = usePrevious(searchResult);

  useLayoutEffect(() => {
    if (searchResult.length > 0 && prev?.length !== searchResult.length) {
      const rect = document.querySelector(window.location.hash)?.getBoundingClientRect();
      if (rect) {
        window.scrollTo(0, rect.top - 120); // 120 px for navigation
      }
    }
  }, [prev, searchResult]);

  return <></>;
}
