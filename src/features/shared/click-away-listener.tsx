"use client";

import { useRef } from "react";
import useClickAway from "react-use/lib/useClickAway";

/**
 * Component that alerts if you click outside of it
 */

interface Props {
  children: any;
  onClickAway: () => void;
  className?: string;
}

export function ClickAwayListener({ className, children, onClickAway }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useClickAway(wrapperRef, () => {
    onClickAway();
  });

  return (
    <div ref={wrapperRef} className={className}>
      {children}
    </div>
  );
}
