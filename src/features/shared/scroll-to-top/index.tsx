"use client";

import React, { useRef } from "react";
import "./_index.scss";
import { chevronUpSvg } from "@/features/ui/svg";
import i18next from "i18next";
import { Tooltip } from "@ui/tooltip";
import useMount from "react-use/lib/useMount";
import useUnmount from "react-use/lib/useUnmount";

export function ScrollToTop() {
  const timerRef = useRef<any>();
  const buttonRef = useRef<HTMLDivElement | null>(null);

  useMount(() => {
    detect();
    window.addEventListener("scroll", scrollChanged);
    window.addEventListener("resize", scrollChanged);
  });

  useUnmount(() => {
    window.removeEventListener("scroll", scrollChanged);
    window.removeEventListener("resize", scrollChanged);
  });

  const scrollChanged = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(detect, 5);
  };

  const detect = () => {
    if (!buttonRef.current) {
      return;
    }

    if (window.scrollY > window.innerHeight) {
      buttonRef.current.classList.add("visible");
      return;
    }

    buttonRef.current.classList.remove("visible");
  };

  return (
    <Tooltip content={i18next.t("scroll-to-top.title")}>
      <div
        ref={buttonRef}
        className="scroll-to-top"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          })
        }
      >
        {chevronUpSvg}
      </div>
    </Tooltip>
  );
}
